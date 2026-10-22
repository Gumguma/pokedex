import PropTypes from 'prop-types';
const DEFAULT_LABELS = {
    date: 'Tanggal',
    location: 'Lokasi',
    level: 'Level',
    nature: 'Sifat (Nature)',
    notes: 'Catatan',
};

export default function JournalForm({
    form,
    setForm,
    natures,
    labels = {},
    onSave,
    onCancel,
    saveLabel = 'Simpan',
}) {
    const text = { ...DEFAULT_LABELS, ...labels };
    const update = (patch) => setForm({ ...form, ...patch });

    return (
        <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className="label-eyebrow">{text.date}</label>
                    <input
                        type="date"
                        value={form.date}
                        onChange={(e) => update({ date: e.target.value })}
                        className="field text-[10px]"
                    />
                </div>
                <div>
                    <label className="label-eyebrow">{text.location}</label>
                    <input
                        type="text"
                        value={form.location}
                        onChange={(e) => update({ location: e.target.value })}
                        placeholder="cth: Rute 1"
                        className="field text-[10px]"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className="label-eyebrow">{text.level}</label>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={form.level}
                        onChange={(e) => update({ level: parseInt(e.target.value, 10) || 5 })}
                        className="field text-[10px]"
                    />
                </div>
                <div>
                    <label className="label-eyebrow">{text.nature}</label>
                    <select
                        value={form.nature}
                        onChange={(e) => update({ nature: e.target.value })}
                        className="field text-[10px]"
                    >
                        {natures.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="label-eyebrow">{text.notes}</label>
                <textarea
                    rows="2"
                    value={form.notes}
                    onChange={(e) => update({ notes: e.target.value })}
                    placeholder="Masukkan cerita petualangan..."
                    className="field text-[10px] resize-none"
                />
            </div>

            <div className="flex gap-2 justify-end pt-1">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="btn-secondary px-3 py-2 text-[9px]">
                        Batal
                    </button>
                )}
                <button type="button" onClick={onSave} className="btn-primary px-3 py-2 text-[9px]">
                    {saveLabel}
                </button>
            </div>
        </div>
    );
}

JournalForm.propTypes = {
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  natures: PropTypes.array.isRequired,
  labels: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  saveLabel: PropTypes.string,
};
