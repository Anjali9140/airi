import os
import sys
import json
import time
import asyncio
import logging
import subprocess
import pyautogui
import pyperclip
import urllib.parse
from contextvars import ContextVar
from playwright.sync_api import sync_playwright

# Force UTF-8 output so browser_use emoji logs don't crash on Windows cp1252
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if sys.stderr.encoding != 'utf-8':
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# Qwen Agent Framework
from qwen_agent.agents import Assistant, VirtualMemoryAgent
from qwen_agent.llm import get_chat_model
from qwen_agent.tools.base import BaseTool, register_tool
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse

from browser_use import Agent as BrowserAgent
from browser_use.browser.service import Browser
from langchain_openai import ChatOpenAI

from mem0 import Memory

import win

logger = logging.getLogger(__name__)
modelName = "ibm-granite/granite-4.0-1b"

# 1. Initialize Local Mem0 (fully local — no OpenAI key needed)
mem0_config = {
    "vector_store": {
        "provider": "qdrant",
        "config": {"path": os.path.join(os.path.dirname(os.path.abspath(__file__)), ".mem0_db")}
    },
    "llm": {
        "provider": "openai",
        "config": {
            "model": "default",
            "openai_base_url": "http://127.0.0.1:11434/v1",
            "api_key": "none",
        }
    },
    "embedder": {
        "provider": "openai",
        "config": {
            "model": "embeddinggemma-300m-Q4_0",
            "openai_base_url": "http://127.0.0.1:11445/v1",
            "api_key": "none",
        }
    }
}

mem_client = Memory.from_config(mem0_config)

# Request-scoped context vars — set per request so tools can read them without kwargs
_current_user_id: ContextVar[str] = ContextVar('user_id', default='default_user')
_current_session_id: ContextVar[str] = ContextVar('session_id', default='default_session')

def _parse(params):
    """Safely parse params: dict, JSON string, Python repr, or raw primitive."""
    if isinstance(params, (dict, list)):
        return params
    try:
        result = json.loads(params)
        return result
    except (json.JSONDecodeError, TypeError):
        try:
            import ast
            return ast.literal_eval(params)
        except Exception:
            return params  # raw string/value fallback

def _get(params, key):
    """Get a named param, handling the case where Qwen passes the value directly."""
    parsed = _parse(params)
    if isinstance(parsed, dict):
        return parsed.get(key)
    # Qwen passed the value directly (e.g. "dir" instead of {"command": "dir"})
    return parsed

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. LLM CONFIGURATION (Optimized for Qwen3-VL-2B) ---
llm_cfg = {
    "model": "default",
    "model_server": "http://127.0.0.1:11434/v1",
    "generate_cfg": {
        "temperature": 0.3,      
        "top_p": 0.85,
        "top_k": 15,             
        "presence_penalty": 1.2,
        "max_tokens": 1536,
    }
}


CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
CHROME_USER_DATA = r"C:\Users\anshv\AppData\Local\Google\Chrome\User Data Airi"

class ChromeBrowser(Browser):
    """Launches system Chrome with real user profile + stealth to avoid bot detection."""

    async def _initialize_session(self):
        from playwright.async_api import async_playwright
        from playwright_stealth import stealth_async

        playwright = await async_playwright().start()

        # Use persistent context so Google sees real cookies/history
        context = await playwright.chromium.launch_persistent_context(
            user_data_dir=CHROME_USER_DATA,
            executable_path=CHROME_PATH,
            headless=False,
            ignore_default_args=['--enable-automation'],
            args=[
                '--disable-blink-features=AutomationControlled',
                '--no-first-run',
                '--no-default-browser-check',
            ],
            viewport={'width': 1280, 'height': 1024},
            user_agent=(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ),
        )

        # Apply stealth to all existing and future pages
        async def apply_stealth(page):
            await stealth_async(page)

        for page in context.pages:
            await apply_stealth(page)
        context.on("page", lambda page: asyncio.ensure_future(apply_stealth(page)))

        page = context.pages[0] if context.pages else await context.new_page()

        from browser_use.browser.views import BrowserState
        from browser_use.browser.service import BrowserSession
        initial_state = BrowserState(
            items=[], selector_map={},
            url=page.url, title=await page.title(),
            screenshot=None, tabs=[],
        )
        self.session = BrowserSession(
            playwright=playwright,
            browser=context,   # persistent context acts as the browser
            context=context,
            current_page=page,
            cached_state=initial_state,
        )
        return self.session

# --- 2. Browser Use for browser Automation ---
@register_tool('browser_automation')
class BrowserAutomationTool(BaseTool):
    description = 'Use this tool to perform complex browser tasks like clicking, typing, and navigating websites.'
    parameters = [{
        'name': 'task',
        'type': 'string',
        'description': 'The specific web automation task to perform (e.g., "Find the price of BTC on Coinbase")',
        'required': True
    }]

    def call(self, params: str, **kwargs) -> str:
        from browser_use.controller.service import Controller

        params = _parse(params)
        task = params['task'] if isinstance(params, dict) else params

        try:
            browser = ChromeBrowser()
            controller = Controller()
            controller.browser = browser
            llm = ChatOpenAI(
                base_url="http://127.0.0.1:11434/v1",
                model="default",
                temperature=0.3,
            )
            browser_sub_agent = BrowserAgent(
                task=task,
                llm=llm,
                controller=controller,
                use_vision=False,
            )
            result = asyncio.run(browser_sub_agent.run())
            return str(result)
        except Exception as e:
            logger.error(f"[browser_automation] failed: {e}")
            return json.dumps({"error": str(e)})

# --- 4. WINDOWS APP CONTROL (Step-by-Step Workflow) ---
ACTIVE_SESSIONS = {}

@register_tool('search_win_app_by_name')
class SearchWinAppByName(BaseTool):
    description = "Step 1: Get the AppId for any app by its name (e.g. 'calc' or 'chrome'). Use this before starting a session."
    parameters = [{
        'name': 'name', 
        'type': 'string', 
        'required': True, 
        'description': 'The name of the app to search for.'
    }]

    def call(self, params: str, **kwargs) -> str:
        # 1. Parse the single 'name' parameter
        p = _parse(params)
        name = p.get('name', '')
        
        # 2. Logic: Ensure the database exists (use absolute path)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        db_path = os.path.join(script_dir, "context", "installed_apps.json")
        if not os.path.exists(db_path):
            win.get_all_windows_apps_installed_AppIds()

        # 3. Logic: Search for the app
        results = win.find_appId_by_name(name)

        # 4. Self-Healing: If not found, refresh the system list and search again
        if isinstance(results, str) and "No Apps found" in results:
            win.get_all_windows_apps_installed_AppIds() # Re-scan system
            results = win.find_appId_by_name(name)

        # 5. Return clean results for the 0.6B model
        if isinstance(results, list):
            # Return only the top 3 results to save context space
            return json.dumps(results[:3], ensure_ascii=False)
        
        return str(results)

@register_tool('start_app_session')
class StartAppSession(BaseTool):
    description = "Launch app using AppId from search_app_id. Returns session status. Store driver in ACTIVE_SESSIONS."
    parameters = [{'name': 'app_id', 'type': 'string', 'required': True, 'description': 'Full AppId like "Microsoft.WindowsNotepad_8wekyb3d8bbwe!App"'}]

    def call(self, params: str, **kwargs) -> str:
        app_id = _get(params, 'app_id')
        driver, message = win.open_win_app_and_start_session(app_id)
        if driver:
            ACTIVE_SESSIONS[app_id] = driver
            return json.dumps({"app_id": app_id, "status": "started", "message": message})
        return json.dumps({"app_id": app_id, "status": "failed", "message": message})

@register_tool('inspect_ui_elements')
class InspectUIElements(BaseTool):
    description = "Capture app UI tree. Run AFTER start_app_session. Saves elements to context/ for next steps."
    parameters = [{'name': 'app_id', 'type': 'string', 'required': True}]

    def call(self, params: str, **kwargs) -> str:
        app_id = _get(params, 'app_id')
        driver = ACTIVE_SESSIONS.get(app_id)
        if not driver:
            return json.dumps({"error": f"No session for {app_id}. Call start_app_session first."})
        result = win.get_all_elements_in_current_window(app_id, driver)
        return json.dumps({"app_id": app_id, "status": "inspected", "elements_saved": True})

@register_tool('list_element_names')
class ListElementNames(BaseTool):
    description = "Get clickable element names from inspected UI. Returns list of strings. Use to find button names."
    parameters = [{'name': 'app_id', 'type': 'string', 'required': True}]

    def call(self, params: str, **kwargs) -> str:
        app_id = _get(params, 'app_id')
        driver = ACTIVE_SESSIONS.get(app_id)
        if not driver:
            return json.dumps({"error": f"No session for {app_id}"})
        names = win.quickly_lookup_all_element_names_in_current_window(app_id, driver)
        return json.dumps({"app_id": app_id, "element_names": names})

@register_tool('get_element_details')
class GetElementDetails(BaseTool):
    description = "Get coords/ID for element by name. Returns: {name, id, x, y, width, height}. Use for clicking."
    parameters = [
        {'name': 'app_id', 'type': 'string', 'required': True},
        {'name': 'element_name', 'type': 'string', 'required': True, 'description': 'Exact name from list_element_names'}
    ]

    def call(self, params: str, **kwargs) -> str:
        p = _parse(params)
        driver = ACTIVE_SESSIONS.get(p['app_id'])
        if not driver:
            return json.dumps({"error": f"No session for {p['app_id']}"})
        details = win.get_element_by_name(p['app_id'], driver, p['element_name'])
        return json.dumps(details if details else {"error": f"Element '{p['element_name']}' not found"})

@register_tool('stop_app_session')
class StopAppSession(BaseTool):
    description = "Close app & cleanup session. Always call when done with an app."
    parameters = [{'name': 'app_id', 'type': 'string', 'required': True}]

    def call(self, params: str, **kwargs) -> str:
        app_id = _get(params, 'app_id')
        driver = ACTIVE_SESSIONS.get(app_id)
        if not driver:
            return json.dumps({"status": "no_session", "app_id": app_id})
        success, message = win.close_app_session(driver)
        if success:
            del ACTIVE_SESSIONS[app_id]
        return json.dumps({"app_id": app_id, "status": "closed" if success else "failed", "message": message})

# 2. Define the Mem0 Tool for Qwen
@register_tool('manage_memory')
class ManageMemory(BaseTool):
    description = 'Store or retrieve user preferences (long-term) or task data (working memory).'
    parameters = [{
        'name': 'action', 'type': 'string', 'description': 'save or search', 'required': True
    }, {
        'name': 'content', 'type': 'string', 'description': 'The info to save or the query to search'
    }, {
        'name': 'memory_type', 'type': 'string', 'description': 'long_term or working'
    }]

    def call(self, params: str, **kwargs) -> str:
        p = _parse(params)
        action = p.get('action') if isinstance(p, dict) else None
        content = p.get('content', '') if isinstance(p, dict) else str(p)
        m_type = p.get('memory_type', 'working') if isinstance(p, dict) else 'working'

        # Read from ContextVar — set in stream_gen's thread before airi.run()
        user_id = _current_user_id.get()
        session_id = _current_session_id.get()

        if action == 'save':
            try:
                # long_term: tied to user only so it persists across all sessions
                # working: tied to both user + session (current chat only)
                if m_type == 'long_term':
                    mem_client.add(content, user_id=user_id, metadata={"type": m_type})
                else:
                    mem_client.add(content, user_id=user_id, session_id=session_id, metadata={"type": m_type})
                return f"Saved to {m_type} memory."
            except Exception as e:
                return json.dumps({"error": str(e)})

        elif action == 'search':
            try:
                # Always search user-level so long_term memories from past sessions are found
                raw = mem_client.search(content, user_id=user_id, limit=10)
                # mem0 returns {"results": [...]} — extract the list safely
                if isinstance(raw, dict):
                    items = raw.get("results", [])
                elif isinstance(raw, list):
                    items = raw
                else:
                    items = []
                # Filter by relevance score and extract text
                memories = [
                    r['memory'] for r in items
                    if isinstance(r, dict) and r.get('memory') and r.get('score', 1.0) >= 0.3
                ]
                return json.dumps(memories) if memories else "No relevant memories found."
            except Exception as e:
                return json.dumps({"error": str(e)})

        return json.dumps({"error": f"Unknown action: {action}. Use 'save' or 'search'."})


SYSTEM_PROMPT = """You are Airi, a Windows desktop AI assistant. Control apps, browse web, run code, manage memory.

RULES:
- ONE tool call per turn. Wait for result before next.
- Never guess app_id — always search_win_app_by_name first.
- Never interact with UI without inspect_ui_elements first.
- Start of conversation: search memory for user context.
- Save user preferences/facts immediately when mentioned.

TOOLS:
search_win_app_by_name(name)
start_app_session(app_id)
inspect_ui_elements(app_id)
list_element_names(app_id)
get_element_details(app_id, element_name)
stop_app_session(app_id)
browser_automation(task)
web_search(query)
manage_memory(action, content, memory_type)  # action: save|search  memory_type: long_term|working
scan_document(file, query)

APP WORKFLOW ORDER:
search_win_app_by_name → start_app_session → inspect_ui_elements → list_element_names → get_element_details → stop_app_session

EXAMPLES:
User: open calculator
→ search_win_app_by_name("calculator")

User: go to youtube
→ browser_automation("go to youtube.com")

User: my name is Alex
→ manage_memory(action="save", content="User name is Alex", memory_type="long_term")

User: what do you know about me?
→ manage_memory(action="search", content="user info")

User: summarize report.pdf
→ scan_document(file="report.pdf", query="summarize")
"""

# --- 6. AGENT INITIALIZATION ---

# DocScanner wrapped as a tool so Assistant can call it without Router overhead
_doc_agent_instance = VirtualMemoryAgent(
    llm=llm_cfg,
    name='DocScanner',
    description='Reads and summarizes large documents or files.',
)

@register_tool('scan_document')
class ScanDocumentTool(BaseTool):
    description = 'Read, summarize, or answer questions about a large document or file.'
    parameters = [
        {'name': 'file', 'type': 'string', 'required': True, 'description': 'Absolute or relative path to the file'},
        {'name': 'query', 'type': 'string', 'required': True, 'description': 'What you want to know about the file'},
    ]

    def call(self, params: str, **kwargs) -> str:
        p = _parse(params)
        file_path = p.get('file', '') if isinstance(p, dict) else ''
        query = p.get('query', '') if isinstance(p, dict) else str(p)
        try:
            messages = [{'role': 'user', 'content': [{'text': query}, {'file': file_path}]}]
            result = ''
            for resp in _doc_agent_instance.run(messages):
                if resp:
                    last = [m for m in resp if m.get('role') == 'assistant']
                    if last:
                        result = last[-1].get('content', '')
            return str(result) if result else 'No result from DocScanner.'
        except Exception as e:
            return json.dumps({'error': str(e)})

# Single Assistant — no Router, no routing confusion
airi = Assistant(
    llm=llm_cfg,
    system_message=SYSTEM_PROMPT,
    function_list=[
        'browser_automation',
        'search_win_app_by_name', 'start_app_session',
        'inspect_ui_elements', 'list_element_names', 'get_element_details',
        'stop_app_session', 'web_search',
        'manage_memory',
        'scan_document',
    ]
)

# --- 7. FASTAPI ENDPOINT (Streaming + Error Handling) ---
@app.post("/v1/chat/completions")
async def chat_completions(request: Request):
    data = await request.json()
    messages = data.get("messages", [])
    user_id = data.get("user_id", "default_user")
    session_id = data.get("session_id", "default_session")

    # Set context vars for this request — captured by closure below, not relied on for thread safety
    _current_user_id.set(user_id)
    _current_session_id.set(session_id)

    def stream_gen():
        # Capture user_id/session_id as closure locals — safe across concurrent requests
        # and across threadpool execution where ContextVar propagation is unreliable
        _uid = user_id
        _sid = session_id
        # Temporarily set context vars inside this thread so ManageMemory.call() reads them
        _current_user_id.set(_uid)
        _current_session_id.set(_sid)

        prev_content = ""
        for response in airi.run(messages):
            if not response: continue
            assistant_msgs = [m for m in response if m.get("role") == "assistant"]
            if not assistant_msgs: continue
            last = assistant_msgs[-1]

            full_content = last.get("content") or ""
            if not isinstance(full_content, str): continue

            delta = full_content[len(prev_content):]
            prev_content = full_content

            if not delta: continue

            chunk = {
                "id": f"chatcmpl-{int(time.time())}",
                "object": "chat.completion.chunk",
                "created": int(time.time()),
                "model": modelName,
                "choices": [{
                    "index": 0,
                    "delta": {"content": delta},
                    "finish_reason": None
                }]
            }

            yield f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(stream_gen(), media_type="text/event-stream")

@app.get("/health")
async def health():
    return {"status": "ok", "model": modelName, "agent": "Airi"}

if __name__ == "__main__":
    import uvicorn
    print("Airi Agent running on http://127.0.0.1:11435")
    print("Tips: Use /health to check status, /v1/chat/completions for requests")
    uvicorn.run(app, host="127.0.0.1", port=11435, log_level="info")