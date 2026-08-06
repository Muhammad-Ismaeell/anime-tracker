export function getMediaUrl(path) {

    if (!path) {
        return "/no-image.png";
    }


    if (path.startsWith("http")) {
        return path;
    }


    return `${import.meta.env.VITE_MEDIA_URL}${path}`;

}