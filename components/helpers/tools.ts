export function classNameWithSize(className: string, size: string): string {
    switch (size) {
        case 'large':
            return className + '-lg';
        case 'small':
            return className + '-sm';
        default:
            return className
    }
}

export function isDate(obj) {
    return Object.prototype.toString.call(obj) === '[object Date]';
}