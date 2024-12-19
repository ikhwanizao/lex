interface FormLabelProps {
    label: string;
    required?: boolean;
    optional?: boolean;
}

export const FormLabel = ({ label, required = false, optional = false }: FormLabelProps) => (
    <label className="block text-sm font-medium text-gray-300">
        <span className="flex items-center gap-2">
            {label}
            {required && <span className="text-red-500">*</span>}
            {(required || optional) && (
                <span className="text-gray-400 text-xs">
                    {required ? 'Required' : 'Optional'}
                </span>
            )}
        </span>
    </label>
);