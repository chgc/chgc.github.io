var exec = require('child_process').exec;

// Hexo 3.x
hexo.on('new', function (path) {    
    switch (process.platform) {
        case "win32":
            exec('"D:\\Program Files\\Typora\\Typora.exe" ' + path.path);
            break;
        case "darwin":
            break;
        default:
            break;
    }    
});