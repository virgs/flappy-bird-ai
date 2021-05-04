export class UrlQueryHandler {
    public getParameterByName(name: string, defaultValue: any = undefined) {
        const url: string = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        const results = regex.exec(url);
        if (!results || !results[2]) {
            return defaultValue;
        }
        return decodeURIComponent(results[2].replace(/\+/g, ' ')) || defaultValue;
    }
}
