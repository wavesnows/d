export default class GitClone{
    
    spawn = require('child_process').spawn;
    repo: string = "";
    targetPath: string = "";
    opts: any;
    cb: any ;
    git: string = "";

    public clone(repo: string, targetPath: string, opts: any, cb: any){
        this.repo = repo;
        this.targetPath = targetPath;
        this.opts = opts;
        this.cb = cb;

        if (typeof opts === 'function') {
            this.cb = opts;
            opts = null;
        }
    
        opts = opts || {};
    
        this.git = opts.git || 'git';

        var args = ['clone'];
    
        if (opts.shallow) {
            args.push('--depth');
            args.push('1');
        }
    
        args.push('--', repo, targetPath);
    
        var process = this.spawn(this.git, args);
        process.on('close', this.cloneCloseHandler.bind(this));

    }

    protected cloneCloseHandler(status: any){
        
        if (status == 0) {
            if (this.opts.checkout) {
                this.checkout();
            } else {
                this.cb && this.cb();    
            }
        } else {
            this.cb && this.cb(new Error("'git clone' failed with status " + status));
        }
        return;
    }

    protected checkout() {
        var args = ['checkout', this.opts.checkout];
        var process = this.spawn(this.git, args, { cwd: this.targetPath });
        process.on('close', this.checkoutCloseHandler.bind(this));
    }

    protected checkoutCloseHandler(status: any){
        if (status == 0) {
            this.cb && this.cb();
        } else {
            this.cb && this.cb(new Error("'git checkout' failed with status " + status));
        }
    }
}