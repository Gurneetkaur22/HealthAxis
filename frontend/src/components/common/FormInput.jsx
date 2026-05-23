const FormInput = ({ label, error, ...props }) => (
  <div>
    {label && <label className="label">{label}</label>}
    <input className={`input-field ${error ? 'border-red-500 focus:ring-red-500' : ''}`} {...props} />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export const FormSelect = ({ label, error, options = [], children, ...props }) => (
  <div>
    {label && <label className="label">{label}</label>}
    <select className={`input-field ${error ? 'border-red-500 focus:ring-red-500' : ''}`} {...props}>
      {children || options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export const FormTextarea = ({ label, error, ...props }) => (
  <div>
    {label && <label className="label">{label}</label>}
    <textarea className={`input-field min-h-[80px] ${error ? 'border-red-500 focus:ring-red-500' : ''}`} {...props} />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export default FormInput;
