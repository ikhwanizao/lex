interface DefinitionDisplayProps {
    definition: string;
}

const DefinitionDisplay = ({ definition }: DefinitionDisplayProps) => {
    const parseDefinitions = (text: string) => {
        return text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map((line, index) => {
                const cleanLine = line.replace(/^\d+\.\s*/, '').trim();
                return {
                    number: index + 1,
                    text: cleanLine
                };
            });
    };

    const definitions = parseDefinitions(definition);

    return (
        <div className="space-y-2">
            {definitions.map((def, index) => (
                <div key={index} className="flex gap-2">
                    <span className="text-blue-400 font-medium min-w-[1.5rem]">
                        {def.number}.
                    </span>
                    <span className="text-gray-300">
                        {def.text}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default DefinitionDisplay;