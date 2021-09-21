// ==UserScript==
// @name         115转存助手ui优化版
// @name:zh      115转存助手ui优化版
// @description  2021.09.011 更新，115转存助手ui优化版 v3.0 (143.2021.0911.1)
// @author       Never4Ever
// @namespace    Fake115Upload@Never4Ever
// @version      143.2021.0911.1
// @description  115文件转存（(based on Fake115Upload 1.4.3 @T3rry)）
// @match        https://115.com/*

// @grant        GM_xmlhttpRequest
// @grant        GM_log
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_setClipboard
// @grant        unsafeWindow
// @grant        GM_registerMenuCommand

// @connect      proapi.115.com
// @connect      webapi.115.com
// @connect      115.com

// @require      https://greasyfork.org/scripts/398240-gm-config-zh-cn/code/GM_config_zh-CN.js
// @require      https://cdn.bootcss.com/jsSHA/2.3.1/sha1.js
// @require      https://cdn.jsdelivr.net/npm/underscore@1.12.0/underscore-min.js
// @require      https://cdn.jsdelivr.net/npm/sweetalert2@11
// @require      https://cdn.jsdelivr.net/npm/node-forge@0.10.0/dist/forge.min.js
// @require      https://unpkg.com/emoutils/dist/umd/emoutils.min.js
// ==/UserScript==


/*********************************************
请从以下获取最新版，或者遇到问题去此反馈，感谢
https://gist.github.com/Nerver4Ever/953447c9ecd330ffc0861d4cbb839369
**********************************************/


(function () {
    'use strict';

    const TIPS = {
        CurrentVersion: "143.2021.0911.1",
        LastUpdateDate: "2021.09.11",
        VersionTips: "115转存助手ui优化版 V3.0",
        UpdateUrl: "https://gist.github.com/Nerver4Ever/953447c9ecd330ffc0861d4cbb839369",
        Sha1FileInputDetails: "",
    };

    const WORKSETTINGS = {
        WorkingItemsNumber: 4,//同时执行任务数
        SleepLittleTime: 500,//短暂休眠,毫秒,暂时在转存中使用
        SleepMoreTime: 1000,//长时休眠,毫秒,暂时在提取中使用
        SleepMuchMoreTime: 8000,//超长休眠,暂时未使用
        ANumber: 27,//随机数,暂时未使用
    };





    function config() {
        var windowCss = '#Cfg4ne .nav-tabs {margin: 20 2} #Cfg4ne .config_var textarea{width: 310px; height: 50px;} #Cfg4ne .inline {padding-bottom:0px;} #Cfg4ne .config_header a:hover {color:#1e90ff;} #Cfg4ne .config_var {margin-left: 6%;margin-right: 6%;} #Cfg4ne input[type="checkbox"] {margin: 3px 3px 3px 0px;} #Cfg4ne input[type="text"] {width: 60px;} #Cfg4ne {background-color: lightgray;} #Cfg4ne .reset_holder {float: left; position: relative; bottom: -1em;} #Cfg4ne .saveclose_buttons {margin: .7em;} #Cfg4ne .section_desc {font-size: 10pt;}';

        GM_registerMenuCommand('设置', opencfg);
        function opencfg() {
            GM_config.open();
        };

        GM_config.init(
            {
                id: 'Cfg4ne',
                title: GM_config.create('a', {
                    href: TIPS.UpdateUrl,
                    target: '_blank',
                    className: 'setTitle',
                    textContent: `${TIPS.VersionTips}设置`,
                    title: `作者：Never4Ever 版本：${TIPS.CurrentVersion}点击访问主页`
                }),
                isTabs: true,
                skin: 'tab',
                css: windowCss,
                frameStyle:
                {
                    height: '400px',
                    width: '570px',
                    zIndex: '2147483648',
                },
                fields:
                {
                    createRootFolderDefaultValue:
                    {
                        section: ['', '转存助手一些功能设置,发包参数暂未开放，敬请期待！'],
                        label: '“sha1转存时，强制在保存处新建根目录”这项默认选中',
                        labelPos: 'right',
                        type: 'checkbox',
                        default: true,
                    },
                    createChildFolderVisible:
                    {
                        label: '显示“sha1转存时，不创建任何子目录”选项；不显示则强制创建子目录',
                        labelPos: 'right',
                        type: 'checkbox',
                        default: false,
                    },
                    advancedRename:
                    {
                        label: '在目录的悬浮工具条处显示“去除分隔符”选项',
                        labelPos: 'right',
                        type: 'checkbox',
                        default: false,
                    },
                    autoUseSeparator:
                    {
                        label: '自动给文件名添加分隔符进行上传，以防文件名违规',
                        labelPos: 'right',
                        type: 'checkbox',
                        default: true,
                    },
                    autoUseSeparatorToRename:
                    {
                        label: '上传结束,自动给文件名去除分隔符，还原原文件名',
                        labelPos: 'right',
                        type: 'checkbox',
                        default: true,
                    },
                    separator:
                    {
                        label: '分隔符方案(推荐非常用汉字；如果分隔符失效,请自行修改)：',
                        type: 'text',
                        default: '變'
                    },
                    uploadNumber:
                    {
                        //section: ['时间参数设置', '注意：参数设置过快，会引起115服务器无响应，为稳定运行参数未启用！'],
                        //label: '转存同时工作任务数:',
                        labelPos: 'left',
                        type: 'hidden',
                        default: '4',
                    },
                    uploadSleepTime:
                    {
                        //label: '转存间隔时间（毫秒）:',
                        labelPos: 'left',
                        type: 'hidden',
                        default: '500',
                    },
                    downloadNumber:
                    {
                        //label: '提取同时工作任务数:',
                        labelPos: 'left',
                        type: 'hidden',
                        default: '4',
                    },
                    downloadSleepTime:
                    {
                        //label: '提取间隔时间（毫秒）:',
                        labelPos: 'left',
                        type: 'hidden',
                        default: '1300',
                    },
                    createFolderSleepTime:
                    {
                        //label: '目录创建间隔时间（毫秒）:',
                        labelPos: 'left',
                        type: 'hidden',
                        default: '300',
                    },
                    checkUpdate:
                    {
                        //section: ['帮助&更新&反馈', '常见错误以及对本脚本进行更新检查与bug反馈'],
                        label: '前往github主页',
                        labelPos: 'right',
                        type: 'button',
                        click: function () {
                            window.open(TIPS.UpdateUrl, "_blank");
                        }
                    },


                },

                events:
                {
                    save: function () {
                        GM_config.close();
                        location.reload();
                    }
                },
            });
    };
    config();

    var currentConfig =
    {
        createRootFolderDefaultValue: 'createRootFolderDefaultValue',
        createChildFolderVisible: 'createChildFolderVisible',
        advancedRename: 'advancedRename',
        autoUseSeparator: 'autoUseSeparator',
        autoUseSeparatorToRename: 'autoUseSeparatorToRename',
        separator: 'separator',
        uploadNumber: 'uploadNumber',
        uploadSleepTime: 'uploadSleepTime',
        downloadNumber: 'downloadNumber',
        downloadSleepTime: 'downloadSleepTime',
        createFolderSleepTime: 'createFolderSleepTime',
    }


    //init setting
    waitForKeyElements("div.file-opr", AddShareSHA1Btn);
    waitForKeyElements("div.dialog-bottom", AddDownloadSha1Btn);
    waitForKeyElements("div.lstc-search", AddShareButtonForSearchItem);

    var zhuancunButton = '<a href="javascript:;"  class="button btn-line btn-upload" menu="offline_task"><i class="icon-operate ifo-linktask"></i><span>链接与sha1转存任务</span><em style="display:none;" class="num-dot"></em></a>';
    $(".left-tvf").eq(0).append(zhuancunButton);

    window.cookie = document.cookie



    //#region 20201230新的提取api相关
    var pub_key = '-----BEGIN PUBLIC KEY-----\
    MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDR3rWmeYnRClwLBB0Rq0dlm8Mr\
    PmWpL5I23SzCFAoNpJX6Dn74dfb6y02YH15eO6XmeBHdc7ekEFJUIi+swganTokR\
    IVRRr/z16/3oh7ya22dcAqg191y+d6YDr4IGg/Q5587UKJMj35yQVXaeFXmLlFPo\
    kFiz4uPxhrB7BGqZbQIDAQAB\
    -----END PUBLIC KEY-----'
    var private_key = '-----BEGIN RSA PRIVATE KEY-----\
    MIICXAIBAAKBgQCMgUJLwWb0kYdW6feyLvqgNHmwgeYYlocst8UckQ1+waTOKHFC\
    TVyRSb1eCKJZWaGa08mB5lEu/asruNo/HjFcKUvRF6n7nYzo5jO0li4IfGKdxso6\
    FJIUtAke8rA2PLOubH7nAjd/BV7TzZP2w0IlanZVS76n8gNDe75l8tonQQIDAQAB\
    AoGANwTasA2Awl5GT/t4WhbZX2iNClgjgRdYwWMI1aHbVfqADZZ6m0rt55qng63/\
    3NsjVByAuNQ2kB8XKxzMoZCyJNvnd78YuW3Zowqs6HgDUHk6T5CmRad0fvaVYi6t\
    viOkxtiPIuh4QrQ7NUhsLRtbH6d9s1KLCRDKhO23pGr9vtECQQDpjKYssF+kq9iy\
    A9WvXRjbY9+ca27YfarD9WVzWS2rFg8MsCbvCo9ebXcmju44QhCghQFIVXuebQ7Q\
    pydvqF0lAkEAmgLnib1XonYOxjVJM2jqy5zEGe6vzg8aSwKCYec14iiJKmEYcP4z\
    DSRms43hnQsp8M2ynjnsYCjyiegg+AZ87QJANuwwmAnSNDOFfjeQpPDLy6wtBeft\
    5VOIORUYiovKRZWmbGFwhn6BQL+VaafrNaezqUweBRi1PYiAF2l3yLZbUQJAf/nN\
    4Hz/pzYmzLlWnGugP5WCtnHKkJWoKZBqO2RfOBCq+hY4sxvn3BHVbXqGcXLnZPvo\
    YuaK7tTXxZSoYLEzeQJBAL8Mt3AkF1Gci5HOug6jT4s4Z+qDDrUXo9BlTwSWP90v\
    wlHF+mkTJpKd5Wacef0vV+xumqNorvLpIXWKwxNaoHM=\
    -----END RSA PRIVATE KEY-----'

    const priv = forge.pki.privateKeyFromPem(private_key);
    const pub = forge.pki.publicKeyFromPem(pub_key);
    const g_key_l = [0x42, 0xda, 0x13, 0xba, 0x78, 0x76, 0x8d, 0x37, 0xe8, 0xee, 0x04, 0x91]
    const g_key_s = [0x29, 0x23, 0x21, 0x5e]
    const g_kts = [0xf0, 0xe5, 0x69, 0xae, 0xbf, 0xdc, 0xbf, 0x5a, 0x1a, 0x45, 0xe8, 0xbe, 0x7d, 0xa6, 0x73, 0x88, 0xde, 0x8f, 0xe7, 0xc4, 0x45, 0xda, 0x86, 0x94, 0x9b, 0x69, 0x92, 0x0b, 0x6a, 0xb8, 0xf1, 0x7a, 0x38, 0x06, 0x3c, 0x95, 0x26, 0x6d, 0x2c, 0x56, 0x00, 0x70, 0x56, 0x9c, 0x36, 0x38, 0x62, 0x76, 0x2f, 0x9b, 0x5f, 0x0f, 0xf2, 0xfe, 0xfd, 0x2d, 0x70, 0x9c, 0x86, 0x44, 0x8f, 0x3d, 0x14, 0x27, 0x71, 0x93, 0x8a, 0xe4, 0x0e, 0xc1, 0x48, 0xae, 0xdc, 0x34, 0x7f, 0xcf, 0xfe, 0xb2, 0x7f, 0xf6, 0x55, 0x9a, 0x46, 0xc8, 0xeb, 0x37, 0x77, 0xa4, 0xe0, 0x6b, 0x72, 0x93, 0x7e, 0x51, 0xcb, 0xf1, 0x37, 0xef, 0xad, 0x2a, 0xde, 0xee, 0xf9, 0xc9, 0x39, 0x6b, 0x32, 0xa1, 0xba, 0x35, 0xb1, 0xb8, 0xbe, 0xda, 0x78, 0x73, 0xf8, 0x20, 0xd5, 0x27, 0x04, 0x5a, 0x6f, 0xfd, 0x5e, 0x72, 0x39, 0xcf, 0x3b, 0x9c, 0x2b, 0x57, 0x5c, 0xf9, 0x7c, 0x4b, 0x7b, 0xd2, 0x12, 0x66, 0xcc, 0x77, 0x09, 0xa6]
    var m115_l_rnd_key = genRandom(16)
    var m115_s_rnd_key = []
    var key_s = []
    var key_l = []
    function intToByte(i) {
        var b = i & 0xFF;
        var c = 0;
        if (b >= 256) {
            c = b % 256;
            c = -1 * (256 - c);
        } else {
            c = b;
        }
        return c
    }
    function stringToArray(s) {
        var map = Array.prototype.map
        var array = map.call(s, function (x) {
            return x.charCodeAt(0);
        })
        return array
    }
    function arrayTostring(array) {
        var result = "";
        for (var i = 0; i < array.length; ++i) {
            result += (String.fromCharCode(array[i]));
        }
        return result;
    }
    function m115_init() {
        key_s = []
        key_l = []
    }
    function m115_setkey(randkey, sk_len) {
        var length = sk_len * (sk_len - 1)
        var index = 0
        var xorkey = ''
        if (randkey) {
            for (var i = 0; i < sk_len; i++) {
                var x = intToByte((randkey[i]) + (g_kts[index]))
                xorkey += String.fromCharCode(g_kts[length] ^ x)
                length -= sk_len
                index += sk_len
            }
            if (sk_len == 4) {
                key_s = stringToArray(xorkey)
            }
            else if (sk_len == 12) {
                key_l = stringToArray(xorkey)
            }
        }
    }
    function xor115_enc(src, key) {
        var lkey = key.length
        var secret = []
        var num = 0
        var pad = (src.length) % 4
        if (pad > 0) {
            for (var i = 0; i < pad; i++) {
                secret.push((src[i]) ^ key[i])
            }
            src = src.slice(pad)
        }
        for (var j = 0; j < src.length; j++) {
            if (num >= lkey) {
                num = num % lkey
            }
            secret.push((src[j] ^ key[num]))
            num += 1
        }
        return secret

    }
    function genRandom(len) {
        var keys = []
        var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz23456789';
        var maxPos = chars.length;
        for (var i = 0; i < len; i++) {
            keys.push(chars.charAt(Math.floor(Math.random() * maxPos)).charCodeAt(0));
        }
        return keys;
    }
    function m115_encode(plaintext) {
        console.log('m115_encode:')
        m115_init()
        key_l = g_key_l
        m115_setkey(m115_l_rnd_key, 4)
        var tmp = xor115_enc(stringToArray(plaintext), key_s).reverse()
        var xortext = xor115_enc(tmp, key_l)
        var text = arrayTostring(m115_l_rnd_key) + arrayTostring(xortext)
        var ciphertext = pub.encrypt(text)
        ciphertext = encodeURIComponent(forge.util.encode64(ciphertext))
        return ciphertext
    }
    function m115_decode(ciphertext) {
        console.log('m115_decode:')
        var bciphertext = forge.util.decode64(ciphertext)
        var block = bciphertext.length / (128)
        var plaintext = ''
        var index = 0
        for (var i = 1; i <= block; ++i) {
            plaintext += priv.decrypt(bciphertext.slice(index, i * 128))
            index += 128
        }
        m115_s_rnd_key = stringToArray(plaintext.slice(0, 16))
        plaintext = plaintext.slice(16);
        m115_setkey(m115_l_rnd_key, 4)
        m115_setkey(m115_s_rnd_key, 12)
        var tmp = xor115_enc(stringToArray(plaintext), key_l).reverse()
        plaintext = xor115_enc(tmp, key_s)
        return arrayTostring(plaintext)
    }

    function PostData(dict) {
        var k, tmp, v;
        tmp = [];
        for (k in dict) {
            v = dict[k];
            tmp.push(k + "=" + v);
        }
        return tmp.join('&');
    };

    function UrlData(dict) {
        var k, tmp, v;
        tmp = [];
        for (k in dict) {
            v = dict[k];
            tmp.push((encodeURIComponent(k)) + "=" + (encodeURIComponent(v)));
        }
        return tmp.join('&');
    };

    function GetSig(userid, fileid, target, userkey) {
        var sha1, tmp;
        sha1 = new jsSHA('SHA-1', 'TEXT');
        sha1.update("" + userid + fileid + fileid + target + "0");
        tmp = sha1.getHash('HEX');
        sha1 = new jsSHA('SHA-1', 'TEXT');
        sha1.update("" + userkey + tmp + "000000");
        return sha1.getHash('HEX', {
            outputUpper: true
        });
    }



    function download(filename, content, contentType) {
        if (!contentType) contentType = 'application/octet-stream';
        var a = document.createElement('a');
        var blob = new Blob([content], { 'type': contentType });
        a.href = window.URL.createObjectURL(blob);
        a.download = filename;
        a.click();
    }

    function RenewCookie() {
        var arryCookie = window.cookie.split(';');
        arryCookie.forEach(function (kv) {
            document.cookie = kv + ";expires=Thu, 01 Jan 2100 00:00:00 UTC;;domain=.115.com"
        }
        )
    }

    function DeleteCookie(resp) {
        try {
            var reg = /set-cookie: .+;/g;
            var setcookie = reg.exec(resp)[0].split(';');
            var filecookie = setcookie[0].slice(11) + "; expires=Thu, 01 Jan 1970 00:00:00 UTC;" + setcookie[3] + ";domain=.115.com";
            document.cookie = filecookie;
            RenewCookie()
            return filecookie;
        }
        catch (err) {
            return null;
        }
    }




    //#endregion

    function hereDoc(f) {
        return f.toString().replace(/^[^\/]+\/\*!?\s?/, '').replace(/\*\/[^\/]+$/, '');
    }

    const MessageType = {
        BEGIN: 0,
        PROCESSING: 1,
        END: 2,
        ERROR: 3,
        CLOSE: 4,
        CANCEL: 5,
        BEGIN4UPLOAD: 6,
        END4UPLOAD: 7,
        NOTIFYINFO: 8
    };

    function createMessage(messageType, msg, id) {
        return { messageType: messageType, msg: msg, targetID: id }
    }

    String.prototype.format = function () {
        if (arguments.length == 0) {
            return this;
        }
        for (var s = this, i = 0; i < arguments.length; i++) {
            s = s.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
        }
        return s;
    };

    var getTamplateLines = function () {
        /*
            <div >
                <div class="itemContent" style="color: red;text-align: left;margin: 10px 0;">
                </div>
                <hr />
                <div style="height:140px;overflow-x: hidden;overflow-y: auto;">
                    <ul class="errorList"  style="font-size: small;text-align: left;font-style: italic; "></ul>
                </div>
            </div>
        */
    };


    //post from iframe
    function postSha1Messgae(message) {
        var postData = {
            eventID: "115sha1",
            data: message
        };

        var text = JSON.stringify(postData);
        window.parent.postMessage(text, "https://115.com/");

    }


    function setTaskCancel() {
        GM_setValue("setTaskCancel", true)
    }

    function resetTaskCancelFlag() {
        GM_setValue("setTaskCancel", false)
    }
    function getTaskCancelFlag() {
        return GM_getValue("setTaskCancel");
    }


    //解决提取时的alert不能全屏的问题
    if (window.top === window.self) {
        $(function () {
            var $itemContent = null;
            var $errorList = null;
            var getTamplate = hereDoc(getTamplateLines);

            $(window).on("message", function (e) {
                var dataInfo = JSON.parse(e.originalEvent.data);
                if (dataInfo.eventID != "115sha1" || e.originalEvent.origin != "https://115.com") return;
                var message = dataInfo.data;

                //ui:
                if (message.messageType == MessageType.BEGIN) {
                    Swal.fire({
                        title: '正在操作中...',
                        html: getTamplate,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        confirmButtonText: `完成`,
                        showCancelButton: true,
                        cancelButtonText: `取消操作`,
                        footer: `重要提示：操作过程中，请置顶该页面防止脚本休眠！`,
                        willOpen: function () {
                            Swal.showLoading(Swal.getConfirmButton());
                            var $swalContent1 = $(Swal.getHtmlContainer());
                            $errorList = $swalContent1.find(".errorList");
                            $itemContent = $swalContent1.find(".itemContent");
                        }
                    }).then((result) => {
                        if (result.dismiss === Swal.DismissReason.cancel) {
                            setTaskCancel();
                            console.log("Cancel Task");
                            Swal.fire({
                                title: '已取消未开始任务，等待已开始任务中...',
                                html: getTamplate,
                                allowOutsideClick: false,
                                allowEscapeKey: false,
                                confirmButtonText: `完成`,
                                footer: `重要提示：操作过程中，请置顶该页面防止脚本休眠！`,
                                willOpen: function () {
                                    Swal.showLoading(Swal.getConfirmButton());
                                    var $swalContent1 = $(Swal.getHtmlContainer());
                                    $errorList = $swalContent1.find(".errorList");
                                    $itemContent = $swalContent1.find(".itemContent");
                                }
                            })
                        }
                    });

                }
                else if (message.messageType == MessageType.PROCESSING) {
                    $itemContent.html(message.msg);
                }
                else if (message.messageType == MessageType.ERROR) {
                    $errorList.append('<li><div display: flex;"><p>' + message.msg + '</p><p style="font-style: italic;"><\p><\div><\li><li><hr/></li>');
                }
                else if (message.messageType == MessageType.END) {
                    $itemContent.html(message.msg);
                    Swal.getTitle().textContent = "操作完成！";
                    Swal.getCancelButton().style.display = "none";
                    Swal.getFooter().style.display = "none";
                    Swal.hideLoading();

                }
                else if (message.messageType == MessageType.CLOSE) {
                    Swal.close();
                }
                else if (message.messageType == MessageType.BEGIN4UPLOAD) {
                    Swal.fire({
                        title: '正在操作中...',
                        html: getTamplate,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        confirmButtonText: `完成`,
                        denyButtonText: `打开目录`,
                        footer: `重要提示：操作过程中，请置顶该页面防止脚本休眠！`,
                        willOpen: function () {
                            Swal.showLoading(Swal.getConfirmButton());
                            var $swalContent1 = $(Swal.getHtmlContainer());
                            $errorList = $swalContent1.find(".errorList");
                            $itemContent = $swalContent1.find(".itemContent");
                        }
                    })
                }
                else if (message.messageType == MessageType.END4UPLOAD) {
                    $itemContent.html(message.msg);
                    Swal.getTitle().textContent = "操作完成！";
                    Swal.getDenyButton().style.display = "block";
                    Swal.getDenyButton().addEventListener('click', e => {
                        console.log("DenyButton click");
                        console.log(message);
                        window.location.href = "https://115.com/?cid=" + message.targetID + "&offset=0&tab=&mode=wangpan";
                    });
                    Swal.getFooter().style.display = "none";
                    Swal.hideLoading();
                }

            })
        });
    }






    function delay(ms) {

        if (ms == 0) {
            ms = 1000 * (Math.floor(Math.random() * (11 - 4)) + 4);
        }
        return new Promise(resolve => setTimeout(resolve, ms))
    }


    //#region 115 api
    //get   UploadInfo
    //return {state:false,user_id:0,userkey:'0',error:''}
    async function getUploadInfo() {
        const r = await $.ajax({
            url: 'https://proapi.115.com/app/uploadinfo',
            dataType: 'json',
            xhrFields: { withCredentials: true }
        });
        return r;
    }

    //add a folder
    //return {state: false, error: "该目录名称已存在。", errno: 20004, errtype: "war"}
    //return {state: true, error: "", errno: "", aid: 1, cid: "2020455078010511975", …}
    async function addFolder(pid, folderName) {
        const postData = PostData({
            pid: pid,
            cname: encodeURIComponent(folderName)
        });

        const r = await $.ajax({
            type: 'POST',
            url: 'https://webapi.115.com/files/add',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            xhrFields: { withCredentials: true },
            dataType: 'json',
            data: postData
        });

        return r;
    }


    //return {data: Array(30), count: 53, data_source: "DB", sys_count: 0, offset: 0, page_size:115, …}
    //return Array type:
    //      [folder]:{cid: "", aid: "1", pid: "", n: "", m: 0, …}
    //      [file]:  {fid: "", uid: 1447812, aid: 1, cid: "", n: "",pc:"",sha:"",s:0,t:"" …}
    async function getDirectChildItemsByOffset(cid, offset) {
        var tUrl = 'https://webapi.115.com/files?aid=1&cid=' + cid + '&o=file_name&asc=1&offset=' + offset + '&show_dir=1&limit=1150&code=&scid=&snap=0&natsort=1&record_open_time=1&source=&format=json&fc_mix=&type=&star=&is_share=&suffix=&custom_order=';
        // var tUrl = "https://aps.115.com/natsort/files.php?aid=1&cid=" + cid + "&o=file_name&asc=1&offset=" + offset + "&show_dir=1&limit=1150&code=&scid=&snap=0&natsort=1&record_open_time=1&source=&format=json&fc_mix=0&type=&star=&is_share=&suffix=&custom_order=";
        const result = await $.ajax({
            type: 'GET',
            url: tUrl,
            dataType: "json",
            xhrFields: { withCredentials: true }
        });
        return result;
    }

    //直接子项目少于1200
    async function getDirectChildItemsByOffsetlt1200(cid, offset) {
        //var tUrl = 'https://webapi.115.com/files?aid=1&cid='+cid+'&o=file_name&asc=1&offset='+offset+'&show_dir=1&limit=1150&code=&scid=&snap=0&natsort=1&record_open_time=1&source=&format=json&fc_mix=&type=&star=&is_share=&suffix=&custom_order=';
        var tUrl = "https://aps.115.com/natsort/files.php?aid=1&cid=" + cid + "&o=file_name&asc=1&offset=" + offset + "&show_dir=1&limit=1150&code=&scid=&snap=0&natsort=1&record_open_time=1&source=&format=json&fc_mix=0&type=&star=&is_share=&suffix=&custom_order=";
        const result = await $.ajax({
            type: 'GET',
            url: tUrl,
            dataType: "json",
            xhrFields: { withCredentials: true }
        });
        return result;
    }

    //return AllDirect items :{id:"",parentID:cid,isFolder:false,name:"",size:0,pc:"",sha:"",paths[] };
    async function getAllDirectItems(cid, folderProcessCallback) {
        var items = new Array();
        var index = 0;
        var flag = true;
        var pageIndex = 1;
        var first = true;
        var isLT1200 = false;

        while (flag) {
            if (getTaskCancelFlag()) break;

            folderProcessCallback(pageIndex);
            var result = null;
            //1200数量，不同的api；这么写减少发包
            if (first) {
                result = await getDirectChildItemsByOffset(cid, index);
                console.log("first >1200 :{0},{1}".format(result.state, result.count));
                if (!result.state) {
                    result = await getDirectChildItemsByOffsetlt1200(cid, index);
                    console.log("first <1200 :{0},{1}".format(result.state, result.count));
                    isLT1200 = true;
                }
                first = false;
            }
            else {
                if (isLT1200) result = await getDirectChildItemsByOffsetlt1200(cid, index);
                else result = await getDirectChildItemsByOffset(cid, index);
            }

            var totalCount = parseInt(result.count);
            if (totalCount >= 1) {
                result.data.forEach(function (item) {
                    var pItem = {
                        id: "",
                        parentID: cid,
                        isFolder: false,
                        name: "",
                        size: "",
                        pickCode: "",
                        sha1: "",
                        paths: new Array(),
                        preid: "",
                        needToRemoved: false
                    };

                    if (item.fid)//文件 fid,cid
                    {
                        pItem.isFolder = false;
                        pItem.id = item.fid;
                        pItem.name = item.n;
                        pItem.pickCode = item.pc;
                        pItem.sha1 = item.sha;
                        pItem.size = item.s;
                    }
                    else //目录 cid,pid
                    {
                        pItem.isFolder = true;
                        pItem.id = item.cid;
                        pItem.name = item.n;
                        pItem.pickCode = item.pc;
                    }


                    var itemIndex = items.findIndex(q => q.name == pItem.name && q.pickCode == pItem.pickCode && q.sha1 == pItem.sha1 && (_.isEqual(q.paths, pItem.paths)));
                    if (itemIndex == -1) items.push(pItem);
                    else {
                        //可能存在同一个目录下，两个文件一模一样,
                        //相同文件处理：不然循环条件退不出
                        //fix:pickcode不一样,先保存着吧
                        pItem.needToRemoved = true;
                        items.push(pItem)
                    }
                })
            }

            console.log("_______________totalCount " + totalCount);
            console.log(items.length)
            //当获取到比pagesize小时，获取结束,1200时有个坑。。。
            if (totalCount <= items.length) {
                break;
            }
            else {
                await delay(500);
                index = items.length;
                pageIndex = pageIndex + 1;
            }
        }

        console.log("cid: {0}, count: {1}".format(cid, items.length));

        var noNullItems = items.filter(q => !q.needToRemoved);
        console.log("cid: {0}, 除去完全重复count: {1}".format(cid, noNullItems.length));

        return noNullItems;
    }

    //return {file_name:"",pick_code:"",sha1:"",count:"",size:"",folder_count:"",paths:[]}
    //return paths:[]层级目录
    async function getFolderInfo(cid) {
        var pUrl = "https://webapi.115.com/category/get?aid=1&cid=" + cid;
        const result = await $.ajax({
            type: 'GET',
            url: pUrl,
            dataType: "json",
            xhrFields: { withCredentials: true }
        });
        console.log(result);
        var pItem = {
            fileCount: parseInt(result.count),
            folderCount: parseInt(result.folder_count),
            id: cid,
            parentID: "",
            isFolder: true,
            name: result.file_name,
            size: result.size,
            pickCode: result.pick_code,
            sha1: "",
            paths: result.paths,
            preid: ""
        };

        return pItem;
    }

    // get fileArray:{id:"",parentID:cid,isFolder:false,name:"",size:0,pc:"",sha:"",paths[] };
    async function getAllFiles(cid, fileArray, topCid, folderProcessCallback) {
        var thisFolder = await getFolderInfo(cid);
        folderProcessCallback(thisFolder.name, 0);
        //空目录，跳过遍历

        if (getTaskCancelFlag()) return;
        if (thisFolder.fileCount == 0) return;
        folderProcessCallback(thisFolder.name)
        var directItems = await getAllDirectItems(thisFolder.id, pageIndex => {
            folderProcessCallback(thisFolder.name, pageIndex);
        });
        //空目录，跳过遍历
        if (directItems.length == 0) return;
        var files = directItems.filter(t => !t.isFolder);
        files.forEach(f => {
            var index = thisFolder.paths.findIndex(q => q.file_id.toString() == topCid);
            var paths = new Array();
            if (index != -1) {
                paths = thisFolder.paths.slice(index).map(q => q.file_name);
            }
            paths.push(thisFolder.name);
            f.paths = paths.slice(1);
            fileArray.push(f);
        });

        var folders = directItems.filter(t => t.isFolder);
        for (var folder of folders) {
            if (getTaskCancelFlag()) break;
            await getAllFiles(folder.id, fileArray, topCid, folderProcessCallback);
            await delay(200);
        }

    }

    //批量重命名 fileArray  [{id:id,name:ddd}]
    //{"state":true,"error":"","errno":0,"data":{"2187365717527997108":"14214.mp4"}}
    async function renameFiles(fileArray) {
        console.log("renameFiles fileArray");
        console.log(fileArray);
        let datas = fileArray.map((value, index, array) => {
            let dataKey = `files_new_name[${value.id}]`;
            let dataValue = value.name;
            return `${encodeURIComponent(dataKey)}=${encodeURIComponent(dataValue)}`;
        }).join("&");

        let renameUrl = "https://webapi.115.com/files/batch_rename";
        const result = await $.ajax({
            type: 'POST',
            url: renameUrl,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            dataType: "json",
            xhrFields: { withCredentials: true },
            data: datas
        });

        return result;
    }


    //获取生成sha1需要preid
    //return: {state:,error:,fileItem:}
    function getFileItemPreid(fileItem) {
        //console.log(fileItem);
        const f = fileItem;
        if (f.size == 0 || f.size == "0") {
            return new Promise((resolve, reject) => {
                const errorMsg = "{0} 文件大小为0，已经跳过！".format(f.filename);
                console.error("errorMsg");
                resolve({ state: false, error: "文件大小为0，已经跳过！", fileItem: fileItem });
            });
        }

        const r = new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "POST",
                url: 'https://proapi.115.com/app/chrome/downurl',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36 115Browser/23.9.3.6' },
                responseType: 'json',
                data: PostData({ data: m115_encode('{"pickcode":"' + fileItem.pickCode + '"}') }),
                onload: function (r) {
                    if (r.status == 200) {
                        var download_info = r.response;

                        //console.log(download_info);
                        if (download_info.state && download_info.data) {
                            try {
                                var json = m115_decode(download_info.data);

                                var url = JSON.parse(json)[fileItem.id]['url']['url'];
                                var resp = r.responseHeaders
                                var setCookie = DeleteCookie(resp)
                                var fileCookie = null;
                                if (setCookie) {
                                    fileCookie = setCookie;
                                }

                                GM_xmlhttpRequest({
                                    method: "GET",
                                    url: url,
                                    timeout: 12000,
                                    headers: {
                                        "Range": "bytes=0-154112",
                                        "Cookie": fileCookie,
                                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36 115Browser/23.9.3.6'
                                    },
                                    responseType: 'arraybuffer',
                                    onload: function (response) {
                                        if (response.status === 206) {
                                            var pre_buff = response.response;
                                            var data = new Uint8Array(pre_buff);
                                            var sha1 = new jsSHA('SHA-1', 'ARRAYBUFFER');
                                            sha1.update(data.slice(0, 128 * 1024));
                                            var preid = sha1.getHash('HEX', {
                                                outputUpper: true
                                            });
                                            fileItem.preid = preid;
                                            resolve({ state: true, error: "", fileItem: fileItem });
                                        }
                                        else if (response.status === 403) {
                                            console.error("Forbidden, 已经用40个0代替");
                                            fileItem.preid = "0000000000000000000000000000000000000000";
                                            resolve({ state: true, error: "", fileItem: fileItem });
                                        }
                                    },
                                    ontimeout: function (res) {
                                        console.error("下载超时，可能文件无法下载或者网络问题");
                                        console.log(res);
                                        resolve({ state: false, error: "下载超时，可能文件无法下载或者网络问题", fileItem: fileItem });
                                    }
                                });
                            } catch (error) {
                                console.error(error);
                                resolve({ state: false, error: "在提取中发生错误...", fileItem: fileItem });
                            }
                        }
                        else {
                            console.log(download_info);
                            resolve({ state: false, error: download_info.msg, fileItem: fileItem });
                        }

                    }
                    else {
                        console.error(response.response);
                        resolve({ state: false, error: "在提取中发生错误...", fileItem: fileItem });
                    }
                }
            });
        });
        return r;
    }

    //格式化sha1 链接
    //return type: {state:succeed,msg:""}
    // false:msg->出错信息
    //true: msg->sha1链接 
    function convertToSha1Link(fileItem, isSimpleFormat) {
        var succeed = false;
        var msg = "格式生成失败!";
        if (fileItem.name && fileItem.size && fileItem.sha1 && fileItem.preid) {
            var sha1Link = "115://" + fileItem.name + "|" + fileItem.size + "|" + fileItem.sha1 + "|" + fileItem.preid;
            if (!isSimpleFormat) {
                if (fileItem.paths.length > 0) {
                    console.log(fileItem.paths);
                    var paths = fileItem.paths.join('|');
                    msg = sha1Link + '|' + paths;
                }
                else {
                    msg = sha1Link;
                }
            }
            else {
                msg = sha1Link;
            }

            succeed = true;
        }

        return { state: succeed, msg: msg };
    }

    // 从sha1link 转换为 FileItem
    //return type:{state:succeed,fileItem:{}}
    //true: fileItem, false:null
    function convertFromSha1Link(sha1Link) {
        var succeed = false;
        var item = {};
        if (sha1Link) {
            if (sha1Link.startsWith("115://")) {
                sha1Link = sha1Link.substring(6);
            }

            var infos = sha1Link.split('|');
            if (infos.length >= 4) {
                item.id = "";
                item.pickCode = "";
                item.name = infos[0];
                item.size = infos[1];
                item.sha1 = infos[2];
                item.preid = infos[3];
                item.parentID = "";
                item.paths = new Array();
                if (infos.length > 4) {
                    if (infos.length == 5 && infos[4].includes('#')) {
                        //兼容 #字符分割
                        item.paths = infos[4].split('#');
                    }
                    else {
                        item.paths = infos.slice(4);
                    }
                }
                item.extension = "";
                item.formatedName = "";
                succeed = true;
            }
        }

        return { state: succeed, fileItem: item };
    }


    function createUploadFile(urlData, postData) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'POST',
                url: 'http://uplb.115.com/3.0/initupload.php?' + urlData,
                data: postData,
                responseType: 'json',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                onload: function (response) {
                    let data = { state: false, error: "", pickCode: "" };
                    if (response.status === 200 && response.response.status === 2) {
                        data.state = true;
                        data.pickCode = response.response.pickcode;
                    }
                    else {
                        console.error(response);
                        let error = "或许sha1链接不匹配?";
                        if (response.status === 405) {
                            error = "频繁请求，已经被115限制 (__！！请立即停止，限制会持续一段时间！！__)：" + response.statusText;
                        }
                        else if (response.response && response.response.message) error = response.response.message;
                        else if (response.response && response.response.statusmsg) error = "可能参数不正确：" + response.response.statusmsg;
                        data.error = error;
                    }
                    resolve(data);
                }
            })

        });
    }

    //return:{state:false,error:"",fileItem:};
    function uploadFile(targetFolder, fileItem, uploadInfo) {

        let fCid = `U_1_${targetFolder}`;
        let appVersion = "25.2.0";

        let urlData = UrlData({
            isp: 0,
            appid: 0,
            appversion: appVersion,
            format: 'json',
            sig: GetSig(uploadInfo.user_id, fileItem.sha1, fCid, uploadInfo.userkey)
        });


        let postData = PostData({
            preid: fileItem.preid,
            fileid: fileItem.sha1,
            quickid: fileItem.sha1,
            app_ver: appVersion,
            filename: encodeURIComponent(fileItem.formatedName),
            filesize: fileItem.size,
            exif: '',
            target: fCid,
            userid: uploadInfo.user_id

        });

        const r = createUploadFile(urlData, postData);

        const x = r.then(t => {
            return new Promise((resole, reject) => {
                fileItem.state = t.state;
                fileItem.pickCode = t.pickCode;
                resole({ state: t.state, error: t.error, fileItem: fileItem });
            })
        });

        return x;
    }

    function setListView() {
        GM_xmlhttpRequest({
            method: "POST",
            url: 'https://115.com/?ct=user_setting&ac=set',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: PostData({
                setting: '{"view_file":"list"}'
            }),
            responseType: 'json',
            onload: function (response) {
                if (response.status === 200) {
                }
            }
        });
    }

    //#endregion



    async function updateParentID(cid, cname, thisLevel, maxLevel, items, sleepTime, createFolderCallback) {
        if (thisLevel == maxLevel) return;
        let files = new Array();
        if (thisLevel == 0) {
            files = items;
        }
        else {
            files = items.filter(f => f.paths[thisLevel - 1] == cname);
        }

        let childFiles = files.filter(q => q.paths.length == thisLevel);
        let childFolderNames = files.map(q => q.paths[thisLevel]).filter(q => q).filter((x, i, a) => a.indexOf(x) == i)

        console.log(`childFiles ${childFiles.length}`)
        //upload file:
        for (let file of childFiles) {
            file.parentID = cid;
            //console.log(file.parentID);
        }

        //create folder:
        for (let folderName of childFolderNames) {
            let r = await addFolder(cid, folderName);
            console.log(r);

            createFolderCallback && createFolderCallback({ state: r.state, folderName: folderName, error: r.error });
            if (r.state) {
                await updateParentID(r.cid, folderName, thisLevel + 1, maxLevel, files, createFolderCallback);
            }
            else {//ui 目录创建失败  todo:
                console.error(`目录  ${folderName}  创建失败`);
            }

            await delay(sleepTime);
        }

    }

    function internelFormat(folder, files, folderParents) {
        var paths = folderParents.slice(0);
        paths.push(folder.dir_name);

        for (var file of folder.files) {

            var link = file + '|' + paths.slice(1).join('|');
            files.push(link);
        }

        for (var childFolder of folder.dirs) {

            internelFormat(childFolder, files, paths)
        }
    }

    //{state:true,error:"",text:""}
    function formatJsonToCommon(text) {

        try {
            var root = JSON.parse(text);
            console.log(root);
            var files = new Array();
            var paths = new Array();
            internelFormat(root, files, paths);
            return { state: true, error: "", text: files.join('\r\n'), rootFolder: root.dir_name };
        }
        catch (error) {
            return { state: false, error: error, text: "" };
        }

    }

    //解析inline text sha1 links,并根据配置设置分隔符;返回FileArray
    function parseSha1LinksToFileArray(text, nameSeparator, errorCallback) {
        let textLines = text.split(/\r?\n/);

        let files = new Array();
        for (let line of textLines) {
            let fLine = line.trim();
            if (!fLine) continue;
            let r = convertFromSha1Link(fLine);
            if (r.state) {
                let nameStrings = r.fileItem.name.split(".");
                let extension = nameStrings.pop();
                r.fileItem.extension = extension;
                //根据配置重新设置文件名
                if (nameSeparator) {
                    //使用emoutils.js库来分割，带有emoji的文件名
                    let fileName = emojiUtils.toArray(nameStrings.join()).map(c => c + nameSeparator).join("").slice(0, -1);
                    r.fileItem.formatedName = fileName + "." + extension;
                }
                else {
                    r.fileItem.formatedName = r.fileItem.name;
                }
                files.push(r.fileItem);
            }
            else {
                errorCallback && errorCallback(`${fLine} 格式错误?`);
            }

        }

        return files;
    }

    //在targetCid下创建目录，成功则返回新目录cid，否则返回原cid
    async function createRootFolder(targetCid, folderName, retryTimes, sleepTime, processCallback) {
        let cid = targetCid;
        for (let i = 0; i < retryTimes; i++) {
            let newFolderName = folderName;
            if (i != 0) {
                newFolderName = `${newFolderName}_${i}`;
            }
            processCallback && processCallback(`正在自动创建根目录${newFolderName}...`);
            let tr = await addFolder(targetCid, newFolderName);
            if (tr.state) {
                cid = tr.cid;
                processCallback && processCallback(`自动创建根目录${newFolderName}成功！`);
                break;
            }
            else {
                processCallback && processCallback(`自动创建根目录${newFolderName}失败！原因：${tr.error}，将自动尝试新的名字...`);
                await delay(sleepTime);
            }
        }
        return cid;
    }

    async function processUpload(fileArray, workingNumber, sleepTime, resultCallback) {
        let index = 1;
        let completed = 0;
        let fileLength = fileArray.length;
        let promisArray = new Array();
        let uploadInfo = await getUploadInfo();
        let msg;
        for (let file of fileArray) {
            console.log(file);
            let r = uploadFile(file.parentID, file, uploadInfo).then(t => {
                completed = completed + 1;
                if (t.state) {
                    msg = `<div align="right"><b>${completed}</b> | <b>${fileLength}</b></div><hr>【 <b>${t.fileItem.name}</b> 】上传成功.`;
                }
                else {
                    let uploadError = `【 <b>${t.fileItem.name}</b> 】上传失败!!! ${t.error}`;
                    resultCallback && resultCallback({ state: false, msg: uploadError });
                    msg = `<div align="right"><b>${completed}</b> | <b>${fileLength}</b></div><hr>${uploadError}`;
                }
                resultCallback && resultCallback({ state: true, msg: msg });
            });

            promisArray.push(r);

            if (index % workingNumber == 0) {
                await delay(sleepTime);
            }

            if (index % 120 == 0) {
                await Promise.all(promisArray);
                let seconds = 3;
                for (let i = 0; i < seconds; i++) {
                    resultCallback && resultCallback({ state: true, msg: `防止115服务器限制，暂停发包。<br><br>${seconds - i}秒后继续....` });
                    await delay(1000);
                }
                promisArray = new Array();
            }
            index = index + 1;
        }

        await delay(500);
        await Promise.all(promisArray);

        return fileArray;
    }

    async function processRename(targetFolderCid, separator, sleepTime, resultCallback) {
        let onlineFiles = new Array();
        await getAllFiles(targetFolderCid, onlineFiles, targetFolderCid, (fname, pIndex) => {
            if (pIndex > 1) {
                resultCallback && resultCallback({ state: true, msg: `正在获取 【${fname}】 下第 ${pIndex} 页的内容...` });
            }
            else {
                resultCallback && resultCallback({ state: true, msg: `正在获取 【${fname}】 下的内容...` });
            }
        });


        let selectedFiles = onlineFiles.filter(f => f.name.search(separator) != -1).map(f => {
            let fo = { id: f.id, name: f.name.split(separator).join("") };
            return fo;
        });

        let i, j, temporary, chunk = 500;
        for (i = 0, j = selectedFiles.length; i < j; i += chunk) {
            temporary = selectedFiles.slice(i, i + chunk);
            resultCallback && resultCallback({ state: true, msg: `正在重命名第${i + 1}到${i + temporary.length}个文件...` });
            let renameResult = await renameFiles(temporary);
            if (renameResult.state === true) {
                resultCallback && resultCallback({ state: true, msg: `重命名第${i + 1}到${i + temporary.length}个文件成功!` });
            }
            else {
                resultCallback && resultCallback({ state: false, msg: renameResult.error });
                resultCallback && resultCallback({ state: true, msg: `重命名第${i + 1}到${i + 1 + temporary.length}个文件中有失败！！!` });
            }
            await delay(sleepTime * 2);
        }

    }

    //通过sha1链接转存文件
    //uploadSetting:{targetCid,text,rootFolder:{needToCreate:true,folderName:""},itemNameSeparator:{needToSeparate:true,separator:""}}
    async function UploadFilesBySha1Links(uploadConfig) {
        console.log("转存参数：");
        console.log(uploadConfig);
        console.log("转存参数结束");
        let formatedText = uploadConfig.text;
        if (!formatedText) return;

        let folderSleepTime = uploadConfig.folderSetting.sleepTime;

        postSha1Messgae(createMessage(MessageType.BEGIN4UPLOAD, "正在解析sha1链接..."));
        //解析json，转为inline text;并且从json中获取root folder name
        if (formatedText.startsWith('{') && formatedText.endsWith('}')) {
            let r = formatJsonToCommon(formatedText);
            if (r.state) {
                uploadConfig.folderSetting.rootFolder.folderName = r.rootFolder;
                formatedText = r.text;
            }
            else {
                console.log("json 解析失败");
                //json 解析失败，提示
            }
        }

        //解析inline text sha1 links,并根据配置设置分隔符
        let nameSeparator = "";
        if (uploadConfig.itemNameSeparator.needToSeparate && uploadConfig.itemNameSeparator.separator) {
            nameSeparator = uploadConfig.itemNameSeparator.separator;
        }

        let files = parseSha1LinksToFileArray(formatedText, nameSeparator, errorMsg => {
            postSha1Messgae(createMessage(MessageType.ERROR, errorMsg));
        });


        postSha1Messgae(createMessage(MessageType.PROCESSING, `获取到链接个数：${files.length}`));
        await delay(500);

        //根目录设置
        //根据配置重新设置targetCid
        let newTargetCid = uploadConfig.targetCid;

        if (uploadConfig.folderSetting.rootFolder.needToCreate === true) {
            let rootFolderName = uploadConfig.folderSetting.rootFolder.folderName;
            newTargetCid = await createRootFolder(newTargetCid, rootFolderName, 11, folderSleepTime * 2, msg => {
                postSha1Messgae(createMessage(MessageType.PROCESSING, msg));
            });

            await delay(500);
        }
        console.log(`newTargetCid: ${newTargetCid}`);

        //子目录设置
        files.forEach(f => {
            f.parentID = newTargetCid;
        });

        if (uploadConfig.folderSetting.notCreateAnyChildFolder === false)//可以创建目录
        {
            console.log("需要创建子目录");
            //根据配置设置每个文件的parent id
            //最大的层次
            let maxLevel = Math.max.apply(Math, files.map(e => e.length));
            let level = 0;
            //cid更新
            await updateParentID(newTargetCid, '',
                level, maxLevel, files, folderSleepTime, t => {
                    let st = t.state ? "成功." : "失败！！！ " + t.error;
                    let msg = `创建子目录 <b>${t.folderName}</b> ${st}`;
                    postSha1Messgae(createMessage(MessageType.PROCESSING, msg));
                    if (!t.state) postSha1Messgae(createMessage(MessageType.ERROR, msg));
                });


        }


        console.log(files);
        //文件上传
        files = await processUpload(files, uploadConfig.upload.workingNumber, uploadConfig.upload.sleepTime, result => {
            if (result.state === true) {
                postSha1Messgae(createMessage(MessageType.PROCESSING, result.msg));
            }
            else {
                postSha1Messgae(createMessage(MessageType.ERROR, result.msg));
            }
        });

        //根据配置，重命名文件
        if (newTargetCid != uploadConfig.targetCid &&
            uploadConfig.itemNameSeparator.needToSeparate &&
            uploadConfig.itemNameSeparator.needToRemoveSeparator &&
            uploadConfig.itemNameSeparator.separator) {
            postSha1Messgae(createMessage(MessageType.PROCESSING, "开始获取文件，并自动重命名..."));
            await delay(folderSleepTime);
            await processRename(newTargetCid, uploadConfig.itemNameSeparator.separator, folderSleepTime, result => {
                if (result.state === true) {
                    postSha1Messgae(createMessage(MessageType.PROCESSING, result.msg));
                }
                else {
                    postSha1Messgae(createMessage(MessageType.ERROR, result.msg));
                }
            });

            postSha1Messgae(createMessage(MessageType.PROCESSING, "文件批量去除分隔符（重命名）完成！"));
            await delay(folderSleepTime * 2);
        }

        var fails = files.filter(q => !q.state);
        var failText = fails.map(function (p) {
            var r = convertToSha1Link(p, false);
            return r.msg;
        }).join("\r\n");

        if (failText) GM_setClipboard(failText);

        let msg = `完成上传！成功 <b>${(files.length - fails.length)}</b> ，失败 <b>${fails.length}</b>\
                <br><br>如果有失败，已将失败sha1链接复制到剪贴板！如果转存失败，请检查sha1链接格式或者在 chrome 上尝试转存。\
                获取最新版，或者遇到问题去此反馈，感谢 !点击-> <a href="${TIPS.UpdateUrl}" target="_blank">${TIPS.VersionTips}</a>`;
        postSha1Messgae(createMessage(MessageType.END4UPLOAD, msg, newTargetCid));

    }



    function GetFileItemByliNode(liNode) {

        var pItem = {
            id: "",
            parentID: "",
            isFolder: false,
            name: "",
            size: 0,
            pickCode: "",
            sha1: "",
            paths: [],
            preid: "",
            selected: false

        };

        var type = liNode.getAttribute("file_type");
        pItem.name = liNode.getAttribute('title');
        pItem.parentID = liNode.getAttribute('p_id');

        var isSelected = liNode.getAttribute('class');
        if (isSelected == "selected") pItem.selected = true;

        if (type == "0") {
            pItem.id = liNode.getAttribute('cate_id');
            pItem.isFolder = true;
        }
        else {
            pItem.size = liNode.getAttribute('file_size');
            pItem.sha1 = liNode.getAttribute('sha1');
            pItem.pickCode = liNode.getAttribute('pick_code');
            pItem.id = liNode.getAttribute('file_id');
        }

        return pItem;
    }

    async function InnerCreateSha1Links(files, txtName) {
        var msg = "";
        var index = 1;
        var completedIndex = 1;
        var promisArray = new Array();

        var gt1200files = files.length >= 1200;
        console.log(">=1200: {0}".format(gt1200files));

        for (var file of files) {

            console.log("0_0");
            let taskCancelFlag = getTaskCancelFlag();
            console.log(taskCancelFlag);
            if (taskCancelFlag === true) {
                console.log("InnerCreateSha1Links has Canceled");
                break;
            }
            console.log("*_*");
            const f = file;
            const r = getFileItemPreid(f).then((t) => {
                if (t.state) {
                    msg = '<div align="right"><b>{0}</b> | <b>{1}</b></div><hr>获取【 <b>{2}</b> 】的sha1链接成功'.format(completedIndex, files.length, t.fileItem.name);
                    postSha1Messgae(createMessage(MessageType.PROCESSING, msg))
                }
                else {
                    msg = '<div align="right"><b>{0}</b> | <b>{1}</b></div><hr>获取【 <b>{2}</b> 】的sha1链接失败！{3}'.format(completedIndex, files.length, t.fileItem.name, t.error);
                    postSha1Messgae(createMessage(MessageType.PROCESSING, msg))
                    var filePath = t.fileItem.paths.join(" > ");
                    console.log(filePath);
                    if (filePath) msg = "{0},原因：{1},路径：{2}".format(t.fileItem.name, t.error, filePath);
                    else msg = "{0},原因：{1}".format(t.fileItem.name, t.error);

                    postSha1Messgae(createMessage(MessageType.ERROR, msg));
                }
                completedIndex = completedIndex + 1;
            });

            promisArray.push(r);

            //自己改代码吧，怎么弄提取逻辑。。太慢，耗时长；太快，115容易没反应
            if (index % WORKSETTINGS.WorkingItemsNumber == 0) {
                await delay(WORKSETTINGS.SleepMoreTime * 2);
                if (index % (WORKSETTINGS.WorkingItemsNumber * 9) == 0) {
                    await Promise.all(promisArray);
                    let seconds = 2;
                    for (let i = 0; i < seconds; i++) {
                        postSha1Messgae(createMessage(MessageType.PROCESSING, `防止115服务器限制，暂停发包中。<br><br>${seconds - i}秒后继续...`));
                        await delay(1000);
                    }
                    promisArray = new Array();
                }
            }

            //
            index = index + 1;
        }

        await Promise.all(promisArray);

        var succeedArray = files.filter(q => q.preid);
        if (succeedArray.length == 1) {
            var result = convertToSha1Link(succeedArray[0], false);
            postSha1Messgae(createMessage(MessageType.CLOSE, ""));

            setTimeout(s => {
                prompt("复制分享链接到剪贴板", s);
            }, 100, result.msg);

        }
        else {
            var text = succeedArray.map(function (p) {
                var r = convertToSha1Link(p, false);
                return r.msg;
            }).join("\r\n");

            if (succeedArray.length > 1) {
                var file_name = txtName + "_sha1.txt";
                if (getTaskCancelFlag()) {
                    file_name = txtName + "_部分提取完成_sha1.txt";
                }
                download(file_name, text);
            }

            msg = '完成【 <b>{0}</b> 】提取！成功 <b>{1}</b> ，失败 <b>{2}</b>'.format(txtName, succeedArray.length, files.length - succeedArray.length)
                + ' <br><br>获取最新版，或者遇到问题去此反馈，感谢 !'
                + '点击-> <a href="' + TIPS.UpdateUrl
                + '" target="_blank">' + TIPS.VersionTips + '</a>';
            console.log(msg);
            postSha1Messgae(createMessage(MessageType.END, msg));
        }
    }

    async function CreateSha1Links(item) {
        //ui: 获取文件中...
        var msg = "正在获取文件...";
        postSha1Messgae(createMessage(MessageType.BEGIN, msg));
        var files = new Array();

        if (!item.isFolder) {
            files.push(item);
        }
        else {
            msg = "正在获取 {0} 下的内容...".format(item.name);
            postSha1Messgae(createMessage(MessageType.PROCESSING, msg));

            await getAllFiles(item.id, files, item.id, (fname, pIndex) => {
                if (pIndex > 1) {
                    msg = "正在获取 【{0}】 下第 {1} 页的内容...".format(fname, pIndex);
                }
                else {
                    msg = "正在获取 【{0}】 下的内容...".format(fname);
                }
                postSha1Messgae(createMessage(MessageType.PROCESSING, msg));
            });

            if (!files || files.length == 0) {
                postSha1Messgae(createMessage(MessageType.END, "【<b>{0}</b> 】空目录???".format(item.name)));
                return;
            }
        }

        postSha1Messgae(createMessage(MessageType.PROCESSING, "获取到 【<b>{0}</b>】 的内容 {1} 项".format(item.name, files.length)));
        await delay(100);
        if (getTaskCancelFlag()) {
            postSha1Messgae(createMessage(MessageType.END, "已经取消任务！"));
        }
        else InnerCreateSha1Links(files, item.name);
    }

    const autoCreateRootFolderTips = {
        msg: `sha1转存时，强制在保存处新建根目录`,
        details: `选择时:&#013;&#010;1.新建根目录名来自sha1转存文件名或者json中的根元素。\
        &#013;&#010;2.如果没有,则按编号(1-10)生成。\
        &#013;&#010;如果未选择或者最终无法提取到目录名，则将保存处作为转存根目录`
    };

    const autoCreateRootFolderString =
        `<div class="linktask-quota" style="margin-top: 10px;display: block">\
        <a>${autoCreateRootFolderTips.msg}</a>\
        <div class="help" title=" ${autoCreateRootFolderTips.details}"><a></a></div>\
        <span>&nbsp;&nbsp;</span><div class="option-switch" style="top:10px;left:10px">\
        <input type="checkbox" checked="true" id="neAutoCreateRootfolder" onclick="function f() {return false}">\
        <label for><i>开启</i><s>关闭</s><b>切换</b></label></div>`;

    const notCreateAnyChildFolderTips = {
        msg: `sha1转存时，不创建任何子目录`,
        details: `选中时，不会自动创建任何子目录。此项与根目录不会影响！`
    };

    const notCreateAnyChildFolderString =
        `<div id="neNotCreateAnyChildFolderParent" class="linktask-quota" style="margin-top: 10px;display: block">\
        <a>${notCreateAnyChildFolderTips.msg}</a>\
        <div class="help" title=" ${notCreateAnyChildFolderTips.details}"><a></a></div>\
        <span>&nbsp;&nbsp;</span><div class="option-switch" style="top:10px;left:10px">\
        <input type="checkbox" checked="true" id="neNotCreateAnyChildFolder" onclick="function f() {return false}">\
        <label for><i>开启</i><s>关闭</s><b>切换</b></label></div>`;

    const selectFileTips = {
        msg: `或者导入sha1链接文件（txt/json）`,
        details: `如果不能正确显示选择文件按钮，可能是与其他脚本或者插件冲突！！`
    };
    const selectFileString = `<div class="linktask-quota" style="margin-top: 10px;">\
        <a>${selectFileTips.msg}</a>\
        <div class="help" title="${selectFileTips.details}"><a></a></div>\
        <span>&nbsp;&nbsp;</span><input type="file" id="neSelectFile" accept=".txt,.json" style="display:block;color:#2777F8;visibility: visible;"></input></div>`;

    const otherSettingString = `<div class="linktask-quota" style="margin-top: 10px;">\
        分隔符可<a id="neSetting1" href="javascript:;" style="color:#2777F8">点此设置</a>。\
        效率考虑：只在自动生成根目录情况下，可按配置自动去除分隔符
        </div>`


    const headerString = `<div id="ne115tipsforheader">${TIPS.VersionTips}(${TIPS.LastUpdateDate}),\
    <a style="color:red;" target="_blank" href=${TIPS.UpdateUrl}>更新&反馈点此!</a>\
    <a href="javascript:;" style="color:#2777F8" id="neSetting2">设置点此！</a></div>`;

    const beginUploadBySha1String = `<div class="con" id="downsha1"><a class="button" href="javascript:;">开始sha1转存</a></div>`;

    function AddDownloadSha1Btn(jNode) {
        var file = "";

        var dialog = document.getElementsByClassName("dialog-box dialog-mini offline-box window-current")[0];
        dialog.style.width = "720px";
        if (document.getElementById('ne115tipsforheader') == null) {
            $(headerString).appendTo(".dialog-header[rel$='title_box']");

            $('#neSetting2')[0].addEventListener('click', e => {
                (document.getElementsByClassName('close')[2].click());
                GM_config.open();
            });
        }


        if (document.getElementById('neSelectFile') == null) {
            var div = document.getElementsByClassName('dialog-input input-offline');

            console.log(div);
            var $selectFile = $(selectFileString);
            var $autoCreateRootFolder = $(autoCreateRootFolderString);
            var $notCreateAnyChildFolder = $(notCreateAnyChildFolderString);
            var $otherSetting = $(otherSettingString);
            div[0].style.display = 'grid';
            div[0].appendChild($selectFile[0]);
            div[0].appendChild($autoCreateRootFolder[0]);
            div[0].appendChild($notCreateAnyChildFolder[0]);
            div[0].appendChild($otherSetting[0]);


            //界面选项设置
            //根目录自动创建默认值：
            document.getElementById('neAutoCreateRootfolder').checked = GM_config.get(currentConfig.createRootFolderDefaultValue);
            //是否显示不创建任何目录：
            document.getElementById('neNotCreateAnyChildFolderParent').style.display = GM_config.get(currentConfig.createChildFolderVisible) === true ? 'block' : 'none';
            document.getElementById('neNotCreateAnyChildFolder').checked = false;

            $selectFile[0].addEventListener('change', e => {
                console.log(e.target.files);
                if (e.target.files) {
                    file = e.target.files[0];
                }
                else {
                    file = "";
                }
            });

            $('#neSetting1')[0].addEventListener('click', e => {
                (document.getElementsByClassName('close')[2].click());
                GM_config.open();
            });


        }
        else {

            //界面选项设置
            document.getElementById('neSelectFile').value = "";
            file = "";
            //根目录自动创建默认值：
            document.getElementById('neAutoCreateRootfolder').checked = GM_config.get(currentConfig.createRootFolderDefaultValue);
            //是否显示不创建任何目录：
            document.getElementById('neNotCreateAnyChildFolderParent').style.display = GM_config.get(currentConfig.createChildFolderVisible) === true ? 'block' : 'none';
            document.getElementById('neNotCreateAnyChildFolder').checked = false;
        }


        if (document.getElementById('downsha1') == null) {

            resetTaskCancelFlag();

            var $btn = $(beginUploadBySha1String);
            jNode[0].appendChild($btn[0]);
            $btn[0].addEventListener('click', e => {

                let cid = $("em[rel=offlint_path_text]").attr("cid");
                if (cid == "") {
                    //目录不存在，比如把 “云下载” 目录删除
                    cid = '0';
                }

                let notCreateAnyChildFolder = document.getElementById('neNotCreateAnyChildFolder').checked;
                let autoCreateRootfolder = document.getElementById('neAutoCreateRootfolder').checked;

                let links = document.getElementById('js_offline_new_add').value;
                let config = {
                    targetCid: cid,
                    text: "",
                    folderSetting: {
                        notCreateAnyChildFolder: notCreateAnyChildFolder,
                        sleepTime: GM_config.get(currentConfig.createFolderSleepTime),
                        rootFolder: {
                            needToCreate: autoCreateRootfolder,
                            folderName: ""
                        },
                    },
                    itemNameSeparator: {
                        needToSeparate: GM_config.get(currentConfig.autoUseSeparator),
                        needToRemoveSeparator: GM_config.get(currentConfig.autoUseSeparatorToRename),
                        separator: GM_config.get(currentConfig.separator)
                    },
                    upload: {
                        workingNumber: GM_config.get(currentConfig.uploadNumber),
                        sleepTime: GM_config.get(currentConfig.uploadSleepTime),
                    }
                };


                if (file) {
                    console.log(file);
                    let reader = new FileReader();
                    reader.addEventListener('load', function (t) {
                        config.folderSetting.rootFolder.folderName = file.name.split(".").slice(0, -1).join();
                        config.text = t.target.result;
                        file = "";
                        UploadFilesBySha1Links(config);
                    });
                    reader.readAsText(file);
                    (document.getElementsByClassName('close')[2].click());

                }
                else if (links) {

                    // var text = { FileName: "", Content: links };
                    config.folderSetting.rootFolder.folderName = "";
                    config.text = links;
                    UploadFilesBySha1Links(config);
                    (document.getElementsByClassName('close')[2].click());

                }



            });
        }

    }


    // function formatCommonToJson(children, root) {
    //     let childFiles = children.filter(f => f.Paths.length == 0);
    //     root.files = Array();
    //     root.dirs = Array();
    //     childFiles.forEach(c => root.files.push({ Name: c.Name }));

    //     let selectedChildren = children.filter(f => f.Paths.length > 0);

    //     let childFolders = selectedChildren.map(q => q.Paths[0]).filter((v, i, a) => a.indexOf(v) === i);
    //     childFolders.forEach(f => root.dirs.push({ dir_name: f }));

    //     root.dirs.forEach(d => {
    //         let newChildren = selectedChildren.filter(f => f.Paths[0] == d.dir_name)
    //             .map(c => {
    //                 let a = { Name: c.Name, Paths: c.Paths.slice(1) };
    //                 return a;
    //             })
    //         ConverterAdvanced(newChildren, d);
    //     });
    // }

    function AddShareSHA1Btn(jNode) {
        var parentNode = jNode[0].parentNode;
        var pItem = GetFileItemByliNode(parentNode);

        //目录，去除分隔符
        if (pItem.isFolder && GM_config.get(currentConfig.advancedRename)) {
            var $btn1 = $('<a><i></i><span>去除分隔符</span></a>');
            $btn1.prependTo(jNode[0]);
            $btn1[0].addEventListener('click', async e => {
                let separator = GM_config.get(currentConfig.separator);
                let sleepTime = GM_config.get(currentConfig.createFolderSleepTime);
                postSha1Messgae(createMessage(MessageType.BEGIN4UPLOAD, ""));
                postSha1Messgae(createMessage(MessageType.PROCESSING, `即将开始重命名 【${pItem.name}】 下所有文件：<br><br>去除分隔符：${separator}`));
                await delay(1000);
                await processRename(pItem.id, separator, sleepTime, result => {
                    if (result.state === true) {
                        postSha1Messgae(createMessage(MessageType.PROCESSING, result.msg));
                    }
                    else {
                        postSha1Messgae(createMessage(MessageType.ERROR, result.msg));
                    }
                });

                postSha1Messgae(createMessage(MessageType.END4UPLOAD, `对目录 【${pItem.name}】下的文件重命名完成！\
                    <br><br>获取最新版，或者遇到问题去此反馈，感谢 !点击->\
                    <a href="${TIPS.UpdateUrl}" target="_blank">${TIPS.VersionTips}</a>`, pItem.id));
            })
        }


        var $btn = $('<a ><i></i><div style="background:white"><span>获取SHA1链接</span></div></a>');
        jNode[0].style.top = "1px";
        jNode[0].style.left = "140px";
        $btn.prependTo(jNode[0]);
        $btn[0].addEventListener('click', e => {
            console.log("生成sha1");
            console.log(pItem);
            //生成sha1
            resetTaskCancelFlag();
            CreateSha1Links(pItem);
        })




        //生成json格式
        // if(pItem.isFolder)
        // {
        //     var $btn1 = $('<a><i></i><span>获取SHA1(json)</span></a>');
        //     $btn1.prependTo(jNode[0]);
        //     $btn1[0].addEventListener('click', e => {
        //         console.log(pItem);
        //     //生成sha1
        //         resetTaskCancelFlag();
        //         CreateSha1Links(pItem);
        //     })
        // }


    }

    async function GetSearchList(isOnlySelected) {
        resetTaskCancelFlag();

        var msg = "正在获取文件...";
        postSha1Messgae(createMessage(MessageType.BEGIN, msg));

        var doc = document.getElementsByClassName('search-iframe')[0];
        if (!doc) doc = document;
        var lis = doc.querySelectorAll('.list-cell.lstc-search > .list-contents > ul > li');
        if (!lis) return;
        console.log(lis);
        var files = new Array();
        for (var li of lis) {
            var fileItem = GetFileItemByliNode(li);
            files.push(fileItem);
        }
        console.log("0: search items{0}".format(files.length));
        if (isOnlySelected) {
            console.log("search items onlySelected")
            files = files.filter(q => q.selected);
        }

        console.log("1: search items{0}".format(files.length));

        console.log(document.URL);
        var url = new URL(document.URL);
        var key = url.searchParams.get("search_value");
        key = key ? key : "搜索结果";
        files = files.filter(q => !q.isFolder);
        msg = "获取到符合搜索的文件数：{0}".format(files.length);
        postSha1Messgae(createMessage(MessageType.PROCESSING, msg));
        await delay(200);
        await InnerCreateSha1Links(files, key)

    }




    function AddShareButtonForSearchItem(node) {

        //每一项
        var lis = node[0].getElementsByTagName('li');
        for (var li of lis) {
            var pItem = GetFileItemByliNode(li);
            var $btn = $('<div class="file-opr" style="left:200px"></div>');
            $btn.appendTo(li);
        }

        //针对当前页面
        $(".left-tvf > a.btn-upload").css("top", "10px");
        if (document.getElementById('btn_selected_sha1') == null) {
            var $btn_selected = $(`<a href="javascript:;" id="btn_selected_sha1" class="button btn-line" style="top:10px">
            <i class="icon-operate ifo-share"></i>
            <span>提取本页选中文件（不包括文件夹）</span>
            <em style="display:none;" class="num-dot"></em>
            </a>`);
            $(".left-tvf").eq(0).append($btn_selected);

            $btn_selected[0].addEventListener('click', e => {
                GetSearchList(true);
            });
        }

        if (document.getElementById('btn_all_sha1') == null) {
            var $btn_all = $(`<a href="javascript:;" id="btn_all_sha1" class="button btn-line" style="top:10px">
            <i class="icon-operate ifo-share"></i>
            <span>提取本页所有文件（不包括文件夹）</span>
            <em style="display:none;" class="num-dot"></em>
            </a>`);
            $(".left-tvf").eq(0).append($btn_all);

            $btn_all[0].addEventListener('click', e => {
                GetSearchList(false);
            });
        }


    }

    /*--- waitForKeyElements(): A utility function, for Greasemonkey scripts,
 that detects and handles AJAXed content.
  
 Usage example:
 waitForKeyElements ("div.comments", commentCallbackFunction);
  
 //--- Page-specific function to do what we want when the node is found.
 function commentCallbackFunction (jNode) {
     jNode.text ("This comment changed by waitForKeyElements().");
 }
  
 IMPORTANT: This function requires your script to have loaded jQuery.
 */

    function waitForKeyElements(
        selectorTxt, /* Required: The jQuery selector string that
    specifies the desired element(s).
    */
        actionFunction, /* Required: The code to run when elements are
    found. It is passed a jNode to the matched
    element.
    */
        bWaitOnce, /* Optional: If false, will continue to scan for
    new elements even after the first match is
    found.
    */
        iframeSelector /* Optional: If set, identifies the iframe to
    search.
    */
    ) {
        var targetNodes, btargetsFound;

        if (typeof iframeSelector == "undefined")
            targetNodes = $(selectorTxt);
        else
            targetNodes = $(iframeSelector).contents()
                .find(selectorTxt);

        if (targetNodes && targetNodes.length > 0) {
            btargetsFound = true;
            /*--- Found target node(s). Go through each and act if they
            are new.
            */
            targetNodes.each(function () {
                var jThis = $(this);
                var alreadyFound = jThis.data('alreadyFound') || false;

                if (!alreadyFound) {
                    //--- Call the payload function.
                    var cancelFound = actionFunction(jThis);
                    if (cancelFound)
                        btargetsFound = false;
                    else
                        jThis.data('alreadyFound', true);
                }
            });
        }
        else {
            btargetsFound = false;
        }

        //--- Get the timer-control variable for this selector.
        var controlObj = waitForKeyElements.controlObj || {};
        var controlKey = selectorTxt.replace(/[^\w]/g, "_");
        var timeControl = controlObj[controlKey];

        //--- Now set or clear the timer as appropriate.
        if (btargetsFound && bWaitOnce && timeControl) {
            //--- The only condition where we need to clear the timer.
            clearInterval(timeControl);
            delete controlObj[controlKey];
        }
        else {
            //--- Set a timer, if needed.
            if (!timeControl) {
                timeControl = setInterval(function () {
                    waitForKeyElements(selectorTxt,
                        actionFunction,
                        bWaitOnce,
                        iframeSelector
                    );
                },
                    300
                );
                controlObj[controlKey] = timeControl;
            }
        }
        waitForKeyElements.controlObj = controlObj;
    }

})();
