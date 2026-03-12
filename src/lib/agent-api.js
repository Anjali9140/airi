export async function callAgentAPI({ prompt, userId, chatId, onTextChunk, onComplete, onError }) {
    try {
        const response = await fetch("/api/agent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt, userId, chatId }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        if (!response.body) {
            throw new Error("No response body returned from the API.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        
        // We need a buffer because chunks over the network might split halfway through a word or a JSON payload
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
                onComplete();
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            
            // Split the buffer by newlines to process line-by-line
            const lines = buffer.split('\n');
            
            // Keep the last incomplete line in the buffer for the next chunk
            buffer = lines.pop() || "";

            for (const line of lines) {
                const trimmedLine = line.trim();
                
                // Only process SSE data lines
                if (trimmedLine.startsWith("data: ")) {
                    const dataStr = trimmedLine.substring(6).trim();

                    try {
                        // Attempt to parse. This will safely fail on the messy Python string dumps
                        const parsedData = JSON.parse(dataStr);

                        // Extract the text token if it exists in this specific event payload
                        if (parsedData?.event?.contentBlockDelta?.delta?.text) {
                            onTextChunk(parsedData.event.contentBlockDelta.delta.text);
                        }
                    } catch (err) {
                        // Silently ignore JSON.parse errors caused by the Python object logs
                        // e.g., data: "{'data': 'Hello', 'delta': ...}"
                    }
                }
            }
        }
    } catch (error) {
        console.error("Stream reading error:", error);
        onError(error);
    }
}