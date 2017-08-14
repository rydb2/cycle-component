export function clssNameWithSize(className: string, size: string): string {
    switch (size) {
        case 'large':
            return className + '-lg';
        case 'small':
            return className + '-sm';
        default:
            return className
    }

}