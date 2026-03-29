"use client"
import { useState } from "react";
import EditMemoryModal from "./EditMemoryModal";
import { NotebookPen, SquarePen, Trash } from "lucide-react";

function MemoryCard({ memory, onDelete, onUpdate }) {
    const [isHovered, setIsHovered]       = useState(false);
    const [showEdit, setShowEdit]         = useState(false);
    const [editText, setEditText]         = useState(memory?.memory || "");
    const [saving, setSaving]             = useState(false);

    // mem0 shape: { id, memory, created_at, updated_at }
    const text      = memory?.memory || "";
    const createdAt = memory?.created_at
        ? new Date(memory.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
        : null;

    const handleSave = async () => {
        if (!editText.trim()) return;
        setSaving(true);
        await onUpdate(memory.id, editText.trim());
        setSaving(false);
        setShowEdit(false);
    };

    return (
        <>
            <div
                className="rounded-2xl bg-bg-modal p-4 transition-all duration-200 hover:shadow-2xl border border-border-default flex flex-col gap-3 min-h-[160px]"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex justify-between items-center">
                    <NotebookPen size={18} className="text-text-muted" />
                    {isHovered && (
                        <div className="flex gap-2 text-text-muted">
                            <button
                                onClick={() => { setEditText(text); setShowEdit(true); }}
                                className="transition-colors cursor-pointer hover:text-text-primary"
                                aria-label="Edit memory"
                            >
                                <SquarePen size={15} />
                            </button>
                            <button
                                onClick={() => onDelete(memory.id)}
                                className="transition-colors cursor-pointer hover:text-red-400"
                                aria-label="Delete memory"
                            >
                                <Trash size={15} />
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-sm text-text-primary leading-relaxed line-clamp-6 flex-1">
                    {text}
                </p>

                {createdAt && (
                    <span className="text-[11px] text-text-muted mt-auto">{createdAt}</span>
                )}
            </div>

            {showEdit && (
                <EditMemoryModal
                    editDescription={editText}
                    setEditDescription={setEditText}
                    handleSaveEdit={handleSave}
                    setShowEditModal={setShowEdit}
                    saving={saving}
                />
            )}
        </>
    );
}

export default MemoryCard;
