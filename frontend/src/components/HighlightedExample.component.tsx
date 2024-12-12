interface HighlightedExampleProps {
    text: string;
    word: string;
}

const HighlightedExample = ({ text, word }: HighlightedExampleProps) => {
    const parts = text.split(new RegExp(`(\\b${word}\\b)`, 'i'));

    return (
        <p className="text-blue-400 italic">
            "
            {parts.map((part, i) => {
                const isMatch = part.toLowerCase() === word.toLowerCase();
                if (isMatch) {
                    return (
                        <span
                            key={i}
                            className="relative inline-block font-semibold px-1 -mx-1"
                        >
                            <span className="absolute inset-0 bg-blue-500/20 rounded-sm blur-[2px]" />
                            <span className="relative text-blue-200">{part}</span>
                        </span>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
            "
        </p>
    );
};

export default HighlightedExample;