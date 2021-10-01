// ==UserScript==
// @name         阿里云盘导出115sha1链接助手ui优化版
// @name:zh      阿里云盘导出115sha1链接助手ui优化版
// @description  2021.09.26更新,阿里云盘导出115sha1链接助手ui优化版
// @author       Never4Ever
// @namespace    aliyundriver4115helper@Never4Ever
// @version      0.3.0926.1
// @match        https://passport.aliyundrive.com/*
// @match        https://www.aliyundrive.com/drive/*
// @match        https://www.aliyundrive.com/drive
// @match        https://aliyundrive.com/drive/*
// @match        https://aliyundrive.com/drive
// @match        http://passport.aliyundrive.com/*
// @match        http://www.aliyundrive.com/drive/*
// @match        http://www.aliyundrive.com/drive
// @match        http://aliyundrive.com/drive/*
// @match        http://aliyundrive.com/drive
// @match        https://www.aliyundrive.com/drive?spm=*
// @match        https://aliyundrive.com/drive?spm=*
// @match        http://www.aliyundrive.com/drive?spm=*
// @match        http://aliyundrive.com/drive?spm=*

// @grant        GM_xmlhttpRequest
// @grant        GM_log
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_setClipboard
// @grant        GM_addStyle

// @connect      api.aliyundrive.com
// @connect      aliyundrive.com
// @connect      alicloudccp.com
// @connect      websv.aliyundrive.com
// @run-at       document-end

// @require      https://cdn.jsdelivr.net/npm/sweetalert2@11
// @require      https://cdn.bootcss.com/jsSHA/2.3.1/sha1.js
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js

// ==/UserScript==


/*
功能：从阿里云盘导出带目录的115sha1转存链接。注意：链接可能在115上转存无效！！！
地址：https://gist.github.com/Nerver4Ever/751c0d68ea8b8d90385974b79fa015de
*/


const versionInfo = {
    lastVersion: "0.2.0926.1",
    name: "阿里云盘导出115sha1链接助手ui优化版",
    url: 'https://gist.github.com/Nerver4Ever/751c0d68ea8b8d90385974b79fa015de'
}

const jobCount = 3;
const seleepTime = 300;


const css = `
    .sha1115Button{
        color:gray;
        height:30px;
        display: none;
        margin-left:auto;
        margin-right:4px;
        border-width: 1px;
        border-style: solid;
        border-color: transparent;
       
    }
    [data-index]:hover .sha1115Button{
        color:white;
        display: block;
        border-color: white;
        opacity:0.3
    }
    .sha1115Button:hover{
        opacity:1 !important;
        background-color: lightslategrey;
    }
    `

GM_addStyle(css);

//api

const sharePattern = /https?:\/\/www.aliyundrive.com\/s\//
const folderPattern = /https?:\/\/www.aliyundrive.com\/drive\/folder\/(\w+)/;
const allFolderPattern = /https?:\/\/www.aliyundrive.com\/drive\/(\w+)/


const old = {
    folderId: "",
    lastUpdateTime: "",
    directItems: []
};

const config = {
    access_token: "",
    refresh_token: "",
    drive_id: "",
};

const httpHeaders = {
    "accept": "application/json, text/plain, */*",
    "content-type": "application/json;charset=UTF-8",
    "origin": "https://www.aliyundrive.com",
    "referer": "https://www.aliyundrive.com/",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36"
};

const httpHeaderWithAuthorization = {
    "accept": "application/json, text/plain, */*",
    "authorization": "",
    "content-type": "application/json;charset=UTF-8",
    "origin": "https://www.aliyundrive.com",
    "referer": "https://www.aliyundrive.com/",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36"
};

function debugLog(o = "") {
    GM_log(o);
}

function delay(ms) {

    if (ms == 0) {
        ms = 1000 * (Math.floor(Math.random() * (11 - 4)) + 4);
    }
    return new Promise(resolve => setTimeout(resolve, ms));
}


function initConfig() {
    let token = JSON.parse(localStorage.getItem('token'));
    config.access_token = token.access_token;
    config.refresh_token = token.refresh_token;
    config.drive_id = token.default_drive_id;
    debugLog("initConfig");
    debugLog(config);
}

function refreshToken() {
    let data = { refresh_token: config.refresh_token };

    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            url: "https://websv.aliyundrive.com/token/refresh",
            method: "POST",
            data: JSON.stringify(data),
            responseType: 'json',
            headers: {
                'Content-Type': "application/json;charset=UTF-8",
            },
            onload: function (xhr) {
                debugLog("refreshToken")
                if (xhr.status === 200) {
                    config.access_token = xhr.response.access_token;
                    httpHeaderWithAuthorization.authorization = "Bearer " + config.access_token
                    resolve(true)
                }
                else resolve(false)
            }
        })
    });


}

async function getDirectChildItemsWithMarker(folderId = 'root', marker = '') {
    let payload = {
        all: false,
        fields: "*",
        drive_id: config.drive_id,
        image_thumbnail_process: "image/resize,w_400/format,jpeg",
        image_url_process: "image/resize,w_1920/format,jpeg",
        limit: 100,
        order_by: "updated_at",
        order_direction: "DESC",
        parent_file_id: folderId,
        url_expire_sec: 1600,
        video_thumbnail_process: "video/snapshot,t_0,f_jpg,ar_auto,w_300"
    }

    if (marker) {
        payload.marker = marker;
    }
    let data = JSON.stringify(payload);
    let headers = {};
    Object.assign(headers, httpHeaderWithAuthorization);

    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            url: "https://api.aliyundrive.com/adrive/v3/file/list",
            method: "POST",
            data: data,
            headers: headers,
            responseType: 'json',
            onload: function (xhr) {
                if (xhr.status === 401) {
                    resolve({ state: false, error: xhr.response.code })
                } else if (xhr.status === 200) {
                    resolve({ state: true, error: "", data: xhr.response })
                }
                else {
                    resolve({ state: false, error: xhr.response.code })
                }
            }
        })
    });

}

function converterDataToFileType(item) {
    let thisFile = { type: item.type, name: item.name, size: item.size, sha1: item.content_hash, url: item.thumbnail, id: item.file_id, isIllegal: true };
    //是否被和谐
    thisFile.isIllegal = item.thumbnail != "https://pds-system-file.oss-cn-beijing.aliyuncs.com/illegal_thumbnail.png";

    return thisFile;
}

async function getDirectChildItems(folderId = "root", processCallback) {
    let items = new Array();
    let marker = "";
    while (true) {
        let result = await getDirectChildItemsWithMarker(folderId, marker);
        if (result.state === true) {
            result.data.items.forEach(item => {
                let thisFile = converterDataToFileType(item);
                items.push(thisFile)
            });
            marker = result.data.next_marker;
            if (marker === "") break;

        }
        else if (result.state === false && result.error === "AccessTokenInvalid") {
            await refreshToken();
        }
        else {//too many requests
            console.log("可能是 too many requests");
            console.error(result);
            await delay(3000);
            await refreshToken();
        }

        await delay(2000);
    }

    debugLog("getDirectChildItems");
    debugLog(items);
    return items;
}

async function getAllChildItems(root, folderId, processCallback = function (folderName, filesCount) { }) {
    let directItems = await getDirectChildItems(folderId);
    debugLog("directItems");
    debugLog(directItems);
    //目录下的文件
    root.files = new Array();
    let files = directItems.filter(f => f.type === "file");
    processCallback(root.name, files.length);
    debugLog(`files>>>>>>: ${files.length}`);
    for (let file of files) {
        root.files.push(file)
    }


    root.dirs = new Array();
    let folders = directItems.filter(d => d.type === "folder");
    for (let dir of folders) {
        let folder = { name: dir.name, id: dir.id };
        await getAllChildItems(folder, dir.id, processCallback);
        root.dirs.push(folder);
        await delay(300);
    }

}


async function getItemInfoInternal(id) {
    let payload = { drive_id: config.drive_id, file_id: id };
    let data = JSON.stringify(payload);
    let headers = {};
    Object.assign(headers, httpHeaderWithAuthorization);

    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            url: "https://api.aliyundrive.com/v2/file/get",
            method: "POST",
            data: data,
            headers: headers,
            responseType: 'json',
            onload: function (xhr) {
                if (xhr.status === 401) {
                    resolve({ state: false, error: xhr.response.code })
                } else if (xhr.status === 200) {
                    resolve({ state: true, error: "", data: xhr.response })
                }
                else {
                    console.error("有未知错误，请打开F12，切换到console记录");
                    console.error(xhr.response);
                    resolve({ state: false, error: "有未知错误，请打开F12，切换到console记录" })
                }
            }
        })
    });
}

async function getItemInfo(id = "root") {
    let r = await getItemInfoInternal(id);
    if (!r.state && r.error === "AccessTokenInvalid") {
        await refreshToken();

        r = await getItemInfoInternal(id);
    }

    return r;
}


async function getDownloadUrl(file_id) {
    let payload = { drive_id: config.drive_id, file_id: file_id };
    let data = JSON.stringify(payload);
    let headers = {};
    Object.assign(headers, httpHeaderWithAuthorization);

    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            url: "https://api.aliyundrive.com/v2/file/get_download_url",
            method: "POST",
            data: data,
            headers: headers,
            responseType: 'json',
            onload: function (xhr) {
                if (xhr.status === 401) {
                    resolve({ state: false, error: xhr.response.code })
                } else if (xhr.status === 200) {
                    resolve({ state: true, error: "", data: xhr.response })
                }
                else {
                    resolve({ state: false, error: xhr.response.code })
                }
            }
        })
    });


}


async function getContentSha1(file_id) {
    let r = await getDownloadUrl(file_id)
    if (!r.state && r.error === "AccessTokenInvalid") {
        await refreshToken();
        r = await getDownloadUrl(file_id)
    }

    debugLog(r);

    if (r.data.url) {
        let headers = {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36",
            "referer": "https://www.aliyundrive.com/",
            "connection": "keep-alive",
            "range": "bytes=0-154112"
        };

        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: r.data.url,
                timeout: 12000,
                headers: headers,
                responseType: 'arraybuffer',
                onload: function (xhr) {
                    if (xhr.status === 206) {
                        let pre_buff = xhr.response;
                        let data = new Uint8Array(pre_buff);
                        let sha1 = new jsSHA('SHA-1', 'ARRAYBUFFER');
                        sha1.update(data.slice(0, 128 * 1024));
                        let contentSha1 = sha1.getHash('HEX', {
                            outputUpper: true
                        });

                        resolve({ state: true, sha1: contentSha1 });
                    }
                    else {
                        console.error(xhr);
                        resolve({ state: false, sha1: "", error: "服务器错误！" });
                    }
                }
            });
        })
    }

}





const MessageType =
{
    Begin: 0,
    End: 1,
    Processing: 2,
    EndWithOneItem: 3,
    Error: 4,
    Count: 5,
}


function reportBegin() {
    display({
        messageType: MessageType.Begin
    });
}

function reportEnd(html) {
    display({
        messageType: MessageType.End,
        msg: html
    });
}

function reportEndWithOne(html) {
    display({
        messageType: MessageType.EndWithOneItem,
        msg: html
    });
}

function reportError(error) {
    display({
        messageType: MessageType.Error,
        error: error
    });
}

function reportCurrent(msg) {
    display({
        messageType: MessageType.Processing,
        msg: msg
    });
}

function reportIndex(total, index) {
    display({
        messageType: MessageType.Count,
        currentIndex: index,
        totalCount: total,
    });
}

const htmlString = `
            <div>
                <div id="count" style="text-align:right;margin-bottom:10px"></div>
                <hr id="hr115">
                <div id="currentItem" style="text-align:left;font-weight: bold;font-size: large;"></div>
                <hr>
                <div style="height:128px;overflow-x: hidden;overflow-y: auto;">
                    <ul id="errorItems" style="list-style-type: disc;font-size: smaller;text-align: left;font-style: italic; ">
                    </ul>
                </div>
            </div>
            `;

var $currentItem, $currentItemResult, $errorItems, $count, $hr115;

//{messageType: "",msg: currentItem:"": currentIndex:0,totalCount: "",error: ""}
function display(message) {
    debugLog(message)
    if (message.messageType == MessageType.Begin) {
        Swal.fire({
            title: '正在操作中...',
            html: htmlString,
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonText: `完成`,
            footer: `<p style="color:red"><b>重要提示：操作过程中，请置顶该页面防止脚本休眠!</b></p>`,
            willOpen: function () {
                Swal.showLoading(Swal.getConfirmButton());
                let $container = $(Swal.getHtmlContainer());
                $currentItem = $container.find("#currentItem");
                $errorItems = $container.find("#errorItems");
                $count = $container.find("#count")
                $hr115 = $container.find("#hr115")
            },
        })
    }
    else if (message.messageType == MessageType.Count) {
        if (message.currentIndex == -1 || message.totalCount == -1) return;
        $count.html(`<span style="color:red">${message.currentIndex}</span>|<span style="color:red"><b>${message.totalCount}</b></span>`);
    }
    else if (message.messageType == MessageType.End) {
        Swal.hideLoading();
        $currentItem.html(message.msg);
        Swal.getTitle().textContent = "操作完成！";
        Swal.getCancelButton().style.display = "none";
        Swal.getFooter().style.display = "none";
        $hr115.css({ display: "none" });
        $count.css({ display: "none" });
        $currentItem.html(message.msg);
    }
    else if (message.messageType == MessageType.Processing) {
        $currentItem.html(message.msg);
    }
    else if (message.messageType == MessageType.EndWithOneItem) {
        Swal.fire({
            title: '完成',
            html: message.msg,
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonText: `完成`,
        })
    }
    else if (message.messageType == MessageType.Error) {
        $errorItems.append(`
        <li>${message.error}</li>
        `);
    }
}

async function createSha1LinksForRoot(root, jsonRoot, callback = function (state, file, error) { }) {
    jsonRoot.dir_name = root.name;
    jsonRoot.files = new Array();
    jsonRoot.dirs = new Array();
    debugLog(`root.files:  ${root.files.length}`);

    let index = 1;
    let promisArray = new Array();
    for (let file of root.files) {
        let r = createSha1LinkForAFile(file).then(t => {
            if (t.state === true) {
                jsonRoot.files.push(converteFileTo115Sha1Link(file))
            }
            else {
                console.error(t);
            }
            callback(t.state, t.file, t.error);
        })

        promisArray.push(r);
        if (index % jobCount == 0) {
            await Promise.all(promisArray);
            await delay(seleepTime);
            promisArray = new Array();
        }
        index++;
    }

    await Promise.all(promisArray);

    debugLog(`root.dirs:  ${root.dirs.length}`);
    for (let dir of root.dirs) {
        let childRoot = { dir_name: '' };
        await createSha1LinksForRoot(dir, childRoot, callback);
        jsonRoot.dirs.push(childRoot);
    }

}


function internelFormat(folder, files, folderParents) {
    let paths = folderParents.slice(0);
    paths.push(folder.dir_name);
    for (let file of folder.files) {
        let link = file;
        let fdomatrPaths = paths.slice(1).join('|');
        if (fdomatrPaths != '') {
            link = file + '|' + fdomatrPaths;
        }
        files.push(link);
    }

    for (let childFolder of folder.dirs) {
        internelFormat(childFolder, files, paths)
    }
}

//{state:true,error:"",text:""}
function formatJsonToCommon(jsonRoot) {
    let files = new Array();
    let paths = new Array();
    internelFormat(jsonRoot, files, paths);
    return files;
}

//单个文件使用
async function createSha1Link(file) {
    let result = await createSha1LinkForAFile(file);
    if (result.state === true) {
        let sha1Link = converteFileTo115Sha1Link(file);
        let msg = `<div style="display:grid"><p style="text-align:left;">${sha1Link}</p></div>`;
        reportEndWithOne(msg);
    } else {
        let errorMsg = `<span style="color:black">${file.name}</span>，<span style="color:red;">115sha1生成失败！！！${result.error}</span>`;
        reportError(errorMsg);
        reportEnd("");
    }
}

//目录使用
async function createSha1Links(root) {

    let totalCount = 0;
    let index = 0;
    await getAllChildItems(root, root.id, (folderName, filesCount) => {
        totalCount = totalCount + filesCount;
        reportIndex(totalCount, index);
        reportCurrent(`获取到当前目录【<b style="color:red">${folderName}</b>】下，文件数量：${filesCount}...`);
    });

    debugLog("root");
    debugLog(root);

    let jsonRoot = {};
    reportCurrent(`开始生成115sha1链接...`);
    await delay(300);
    let succeedCount = 0;
    await createSha1LinksForRoot(root, jsonRoot, (state, thisFile, error) => {
        index++;
        reportIndex(totalCount, index);
        let msg = "";
        let errorMsg = "";
        if (state === true) {
            succeedCount++;
            msg = `115sha1生成成功！文件：<b>${thisFile.name}</b>`;
        }
        else {
            msg = `<span style="color:red">115sha1生成失败！！！文件：<b>${thisFile.name}</b></span><hr>${error}`;
            errorMsg = `<span style="color:black">${thisFile.name}</span>，<span style="color:red;">115sha1生成失败！！！${error}</span>`;
            reportError(errorMsg);
        }

        reportCurrent(msg);
    });
    debugLog("jsonRoot");
    //debugLog(jsonRoot);

    //可生成json
    let files = formatJsonToCommon(jsonRoot);
    debugLog(`files.length: ${files.length}`);

    let report = "";
    if (files.length == 0) {
        report = `<div style="display:flex">【<p style="color:red">${root.name}</p>】,空目录或者未获取到有效文件？</div>`
    }
    else if (files.length == 1) {
        report = files[0];
    }
    else if (files.length > 1) {
        report = `
        <div><span style="display:flex">完成对【<p style="color:red">${root.name}</p>】的提取！成功<b style="color:red">${succeedCount}</b>，
        失败<b style="color:red">${(totalCount - succeedCount)}</b></span>
        <br><b style="color:red">注意：导出的115转存链接，有效情况依据115服务器</b>
        <br>获取最新版，或者遇到问题去此反馈，感谢 !
        点击-> <a href="${versionInfo.url}" target="_blank">
        ${versionInfo.name}(${versionInfo.lastVersion})</a>
        </div>
    `;
        let text = files.join("\r\n");
        let fileName = root.name + "_从阿里云盘导出_sha1.txt";
        download(fileName, text);
    }
    reportEnd(report);
}

function download(filename, content, contentType) {
    if (!contentType) contentType = 'application/octet-stream';
    var a = document.createElement('a');
    var blob = new Blob([content], { 'type': contentType });
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}

//file: {id:_,name:_,size:,sha1:_,textSha1:_}
function converteFileTo115Sha1Link(file) {
    return `115://${file.name}|${file.size}|${file.sha1}|${file.textSha1}`;
}

//file: {id:_,name:_,size:,sha1:_,textSha1:_}
async function createSha1LinkForAFile(file) {
    let result = { state: true, file: file, error: '' }
    if (file.isIllegal) {
        if (file.size > 128 * 1024) {
            let t = await getContentSha1(file.id);
            if (t.state) {
                file.textSha1 = t.sha1;
            }
            else {
                result.state = false;
                result.error = t.error;
            }
        }
        else {
            file.textSha1 = file.sha1;
        }
    }
    else {
        result.state = false;
        result.error = "该文件已经被和谐！";
    }

    return result;
}


function addXMLRequestCallback(callback) {
    var oldSend, i;
    if (XMLHttpRequest.prototype.callbacks) {
        XMLHttpRequest.prototype.callbacks.push(callback);
    } else {
        XMLHttpRequest.prototype.callbacks = [callback];
        oldSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function () {
            for (i = 0; i < XMLHttpRequest.prototype.callbacks.length; i++) {
                XMLHttpRequest.prototype.callbacks[i](this);
            }
            oldSend.apply(this, arguments);
        }
    }
}


console.log("loading....")
//logic business
var itemsInThisFolder = new Array();
var thisFolderId = getFolderId();

initConfig();
waitForKeyElements("[data-index]", AddShareSHA1Btn);

debugLog("id: " + thisFolderId)

function getFolderId() {
    let url = window.location.href;
    let folderId = "root";
    if (!sharePattern.test(url) && allFolderPattern.test(url)) {

        let match = url.match(folderPattern);
        if (match) folderId = match[1];

    }
    return folderId;
}

addXMLRequestCallback(function (xhr) {
    //CreateBanList
    xhr.addEventListener("load", function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            if (xhr.responseURL === "https://api.aliyundrive.com/v2/file/list" || xhr.responseURL === 'https://api.aliyundrive.com/adrive/v3/file/list') {
                let sendParams = JSON.parse(xhr.sendParams[0]);
                //console.log(`event: ${sendParams.parent_file_id}:${thisFolderId}`)
                let currentId = getFolderId();
                if (thisFolderId != currentId) {
                    //目录已经切换
                    itemsInThisFolder = new Array();
                    thisFolderId = currentId;
                }

                if (sendParams.parent_file_id === thisFolderId) {
                    let response = JSON.parse(xhr.response);
                    if (response.items) {
                        response.items.forEach(item => {
                            let thisFile = converterDataToFileType(item);
                            if (itemsInThisFolder.findIndex(q => q.id === thisFile.id) === -1) {
                                itemsInThisFolder.push(thisFile);
                            }
                        });
                    }
                }
            }
        }
    });

});

//在文件的详细中显示文件的sha1
const fileSha1String = `<div>
<div>本文件的sha1<div>
<div id="fileSha1"></div>
</div>`;

function getItemByModalNode(node) {
    let name = node.innerText.split('\n')[0];
    let item = itemsInThisFolder.find(q => q.name == name);
    return item;
}

function setFileSha1($node) {

    let item = getItemByModalNode($node[0]);
    if(!item)
    {
        console.log($node[0]);
        return;
    }
    let $fileSha1 = $node.find("#fileSha1");
    if ($fileSha1.length == 0) {
        let $div = $node.find('div[class^="group-wrapper"').last();
        $div.append(fileSha1String);
        $fileSha1 = $node.find("#fileSha1");
    }
    console.log(item);
    if (item.type === "file") {
        $fileSha1.text(item.sha1);
    }
    else {
        $fileSha1.text('(不对文件夹计算此项!)');
    }
}

var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.type == "attributes" && mutation.attributeName == "style"&&mutation.target.style.display!='none') {
            setFileSha1($(mutation.target));
        }
    });
});


waitForKeyElements(".ant-modal-wrap", $node => {
    setFileSha1($node);
    observer.observe($node[0], {
        attributes: true //configure it to listen to attribute changes
    });
});






function AddShareSHA1Btn(node) {

    //只在folder下有效

    let url = window.location.href;

    if (sharePattern.test(url)) return;

    if (allFolderPattern.test(url) && !folderPattern.test(url)) return;

    //debugLog(`url: ${url}, 显示按钮！`);

    var $div = node.find('[data-icon-type="PDSMore"]').parent('div');
    var itemName = node.find('[data-col-key="name"] > p').text();
    var $btn = $('<div class="sha1115Button" title="导出符合115的sha1转存链接"><span style="line-height:2;margin:0 4px;">*115sha1*</span></div>');
    $div.after($btn);
    $btn.on("click", async function (event) {
        event.stopPropagation();

        console.log(`点击了 ${itemName}`);
        //获取当前页信息，folderId，数量，有变动，

        reportBegin();
        reportCurrent(`正在获取【<b style="color:red">${itemName}</b>】的信息...`);

        let item;
        debugLog("click item")
        item = itemsInThisFolder.find(q => q.name === itemName);
        // if (!item) {
        //     reportCurrent(`正在重新获取【<b style="color:red">${itemName}</b>】的信息，请稍后...`);
        //     itemsInThisFolder = await getDirectChildItems(currentFolderId);
        //     item = itemsInThisFolder.find(q => q.name === itemName);
        // }

        debugLog(item);
        if (item) {
            if (item.type === "folder") {
                reportCurrent(`正在获取【<b style="color:red">${itemName}</b>】下文件以及目录...`);
                let root = { name: item.name, id: item.id };
                await createSha1Links(root);
            }
            else {
                await createSha1Link(item);
            }
        }
        else {
            Swal.fire({
                title: `出错！！`,
                html: `无法获取到目录【<b style="color:red">${itemName}</b>】信息，请刷新网页后再尝试！`,
                confirmButtonText: `刷新网页`,
            }).then(r => {
                location.reload();
            });
        }



    })
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








