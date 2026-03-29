'use client'
import { useState, useEffect, useCallback } from "react";
import DocumentSection from "./LibraryCompo/DocumentSection";
import MediaSection from "./LibraryCompo/MediaSection";

const AGENT_URL = "http://127.0.0.1:11435";

const LibraryCompo = () => {
    const [documents, setDocuments] = useState([]);
    const [media, setMedia]         = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);

    const fetchFiles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res  = await fetch(`${AGENT_URL}/library`);
            const data = await res.json();
            setDocuments(data.documents || []);
            setMedia(data.media || []);
        } catch (e) {
            setError("Could not connect to agent server.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchFiles(); }, [fetchFiles]);

    const handleDelete = useCallback(async (filename) => {
        try {
            await fetch(`${AGENT_URL}/library/${encodeURIComponent(filename)}`, { method: "DELETE" });
            setDocuments((prev) => prev.filter((d) => d.name !== filename));
            setMedia((prev) => prev.filter((m) => m.name !== filename));
        } catch (e) {
            console.error("[library] delete error:", e);
        }
    }, []);

    return (
        <div className="w-full h-full overflow-y-auto py-6">
            <div className="max-w-5xl mx-auto px-4">
                <h1 className="text-2xl font-normal text-text-primary mb-6 px-4">My stuff</h1>

                {loading && (
                    <p className="px-4 text-sm text-text-muted animate-pulse">Loading files...</p>
                )}

                {error && (
                    <p className="px-4 text-sm text-red-400">{error}</p>
                )}

                {!loading && !error && documents.length === 0 && media.length === 0 && (
                    <p className="px-4 text-sm text-text-muted">
                        No files yet. Upload documents or images to Airi and they'll appear here.
                    </p>
                )}

                {!loading && !error && (
                    <>
                        {documents.length > 0 && (
                            <DocumentSection documents={documents} onDelete={handleDelete} />
                        )}
                        {media.length > 0 && (
                            <MediaSection media={media} agentUrl={AGENT_URL} onDelete={handleDelete} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default LibraryCompo;
