"use client"

function EditMemoryModal({ editDescription, setEditDescription, setShowEditModal, handleSaveEdit, saving }) {
    return (
        <div className="fixed inset-0 bg-bg-app/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-bg-card rounded-2xl p-6 w-96 max-w-full mx-4 border border-border-default">
                <h2 className="text-xl font-semibold text-text-primary mb-4">Edit Memory</h2>

                <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-text-primary resize-none outline-none bg-bg-modal border border-border-default focus:border-border-active"
                    placeholder="Memory content"
                    rows={6}
                    autoFocus
                />

                <div className="flex gap-3 justify-end mt-4">
                    <button
                        onClick={() => setShowEditModal(false)}
                        className="px-4 py-2 rounded-lg border border-border-default text-text-primary opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="px-4 py-2 rounded-lg bg-accent-blue/50 text-text-primary hover:bg-accent-blue transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditMemoryModal;
