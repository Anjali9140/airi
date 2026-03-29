"use client"
import { useState, useEffect, useCallback } from "react";
import MemoryCard from "./memoryCompo/MemoryCard";
import InitialMemorySec from "./memoryCompo/InitialMemorySec";

const AGENT_URL = "http://127.0.0.1:11435";

function MemoryCompo({ userId = "default_user" }) {
    const [memories, setMemories] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    const fetchMemories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res  = await fetch(`${AGENT_URL}/memories?user_id=${encodeURIComponent(userId)}`);
            const data = await res.json();
            setMemories(data.memories || []);
        } catch {
            setError("Could not connect to agent server.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { fetchMemories(); }, [fetchMemories]);

    const handleDelete = useCallback(async (memoryId) => {
        try {
            await fetch(`${AGENT_URL}/memories/${memoryId}`, { method: "DELETE" });
            setMemories((prev) => prev.filter((m) => m.id !== memoryId));
        } catch (e) {
            console.error("[memory] delete error:", e);
        }
    }, []);

    const handleUpdate = useCallback(async (memoryId, newText) => {
        try {
            await fetch(`${AGENT_URL}/memories/${memoryId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: newText }),
            });
            setMemories((prev) =>
                prev.map((m) => m.id === memoryId ? { ...m, memory: newText } : m)
            );
        } catch (e) {
            console.error("[memory] update error:", e);
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-app flex items-center justify-center">
                <p className="text-text-muted animate-pulse">Loading memories...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-bg-app flex items-center justify-center">
                <p className="text-red-400 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-app text-text-primary flex flex-col items-center justify-start p-6">
            {memories.length === 0 ? (
                <InitialMemorySec />
            ) : (
                <>
                    <div className="w-full max-w-7xl mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Memories</h2>
                        <span className="text-sm text-text-muted">{memories.length} stored</span>
                    </div>
                    <div className="grid grid-cols-4 max-md:grid-cols-2 max-lg:grid-cols-3 max-sm:grid-cols-1 gap-4 w-full max-w-7xl select-none">
                        {memories.map((memory) => (
                            <MemoryCard
                                key={memory.id}
                                memory={memory}
                                onDelete={handleDelete}
                                onUpdate={handleUpdate}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default MemoryCompo;
