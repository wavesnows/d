import downloadUrl from 'download'
import GitClone from './GitClone'


/**
 * Expose `download`.
 */

export default class DownloadRepo{


  protected rm = require('rimraf').sync
  protected dest: string = ""
  protected fn: any 

/**
 * Download `repo` to `dest` and callback `fn(err)`.
 *
 * @param {String} repo
 * @param {String} dest
 * @param {Object} opts
 * @param {Function} fn
 */

public download (repo: string, dest: string, opts: any, fn: Function) {
    if (typeof opts === 'function') {
      fn = opts
      opts = null
    }
    opts = opts || {}
    var clone = opts.clone || false
    delete opts.clone

  
    var repoObj: any = this.normalize(repo)
    var url = repoObj.url || this.getUrl(repoObj, clone)
    
    this.dest = dest;
    this.fn = fn;

    var gitclone = new GitClone();

    console.log(url,dest)
  
    if (clone) {
      var cloneOptions = {
        checkout: repoObj.checkout,
        shallow: repoObj.checkout === 'master',
        ...opts
      }

      gitclone.clone(url, dest, cloneOptions, this.cloneHandler.bind(this))
    } else {
      var downloadOptions = {
        extract: true,
        strip: 1,
        mode: '666',
        ...opts,
        headers: {
          accept: 'application/zip',
          ...(opts.headers || {})
        }
      }
      downloadUrl(url, dest, downloadOptions)
        .then(function (data) {
          fn(data)
        })
        .catch(function (err) {
          fn(err)
        })
    }
  }

  protected cloneHandler(err:any) {
    if (err === undefined) {
      this.rm(this.dest + '/.git')
      this.fn()
    } else {
      this.fn(err)
    }
  }
  
  /**
   * Normalize a repo string.
   *
   * @param {String} repo
   * @return {Object}
   */
  
  private normalize (repo: string) {
    var regex = /^(?:(direct):([^#]+)(?:#(.+))?)$/
    var matchObj: any = regex.exec(repo)

  
    if (matchObj) {
      var url = matchObj[2]
      var directCheckout = matchObj[3] || 'master'
  
      return {
        type: 'direct',
        url: url,
        checkout: directCheckout
      }
    } else {
      regex = /^(?:(github|gitlab|bitbucket):)?(?:(.+):)?([^/]+)\/([^#]+)(?:#(.+))?$/

      matchObj = regex.exec(repo) 
      var type = matchObj[1] || 'github'
      var origin = matchObj[2] || null
      var owner = matchObj[3]
      var name = matchObj[4]
      var checkout = matchObj[5] || 'master'
  
      if (origin == null) {
        if (type === 'github') {
          origin = 'github.com'
        } else if (type === 'gitlab') {
          origin = 'gitlab.com'
        } else if (type === 'bitbucket') {
          origin = 'bitbucket.org'
        }
      }
  
      return {
        type: type,
        origin: origin,
        owner: owner,
        name: name,
        checkout: checkout
      }
    }
  }
  
  /**
   * Adds protocol to url in none specified
   *
   * @param {String} url
   * @return {String}
   */
  
  private addProtocol (origin: string, clone: any): string {
    if (!/^(f|ht)tps?:\/\//i.test(origin)) {
      if (clone) {
        origin = 'git@' + origin
      } else {
        origin = 'https://' + origin
      }
    }
  
    return origin
  }
  
  /**
   * Return a zip or git url for a given `repo`.
   *
   * @param {Object} repo
   * @return {String}
   */
  
  private getUrl (repo:any, clone:any):string {
    var url: string =''
  
    // Get origin with protocol and add trailing slash or colon (for ssh)
    var origin = this.addProtocol(repo.origin, clone)
    if (/^git@/i.test(origin)) {
      origin = origin + ':'
    } else {
      origin = origin + '/'
    }
  
    // Build url
    if (clone) {
      url = origin + repo.owner + '/' + repo.name + '.git'
    } else {
      if (repo.type === 'github') {
        url = origin + repo.owner + '/' + repo.name + '/archive/' + repo.checkout + '.zip'
      } else if (repo.type === 'gitlab') {
        url = origin + repo.owner + '/' + repo.name + '/repository/archive.zip?ref=' + repo.checkout
      } else if (repo.type === 'bitbucket') {
        url = origin + repo.owner + '/' + repo.name + '/get/' + repo.checkout + '.zip'
      }
    }
  
    return url
  }
  
}
