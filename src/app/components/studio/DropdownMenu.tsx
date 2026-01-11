import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface DropdownMenuProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    align?: 'left' | 'right';
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ trigger, children, align = 'right' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)}>
                {trigger}
            </div>

            {isOpen && (
                <div
                    className={`absolute top-full mt-2 w-64 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-200 ${align === 'left' ? 'left-0' : 'right-0'
                        }`}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

interface DropdownItemProps {
    icon?: React.ReactNode;
    label: string;
    shortcut?: string;
    onClick: () => void;
    disabled?: boolean;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
    icon,
    label,
    shortcut,
    onClick,
    disabled = false
}) => {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                if (!disabled) onClick();
            }}
            disabled={disabled}
            className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors ${disabled
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-muted/50 text-foreground'
                }`}
        >
            <div className="flex items-center gap-3">
                {icon && <span className="w-4 h-4 flex items-center justify-center text-muted-foreground">{icon}</span>}
                <span className="font-medium">{label}</span>
            </div>
            {shortcut && (
                <kbd className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                    {shortcut}
                </kbd>
            )}
        </button>
    );
};

export const DropdownSeparator: React.FC = () => {
    return <div className="h-px bg-border/50 my-1" />;
};

export const DropdownSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    return (
        <div className="py-1">
            <div className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {title}
            </div>
            {children}
        </div>
    );
};
