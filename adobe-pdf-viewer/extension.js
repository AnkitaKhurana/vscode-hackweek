const vscode = require('vscode');

function activate(context) {
    // Register the command to process PDFs
    let disposable = vscode.commands.registerCommand('extension.processPDF', (uri) => {
        vscode.window.showInformationMessage(`Processing: ${uri.fsPath}`);
        createWebviewPanel(uri);
    });

    context.subscriptions.push(disposable);

    // Listen for when a PDF file is opened
    vscode.workspace.onDidOpenTextDocument((document) => {
        if (document.fileName.endsWith('.pdf')) {
            vscode.commands.executeCommand('extension.processPDF', document.uri);
        }
    });
}

function fetchBuffer(uri) {
    return new Promise((resolve) => {
        vscode.workspace.fs.readFile(uri).then((data) => {
            console.log(data);
            resolve(data);
        });
    });
}
let cspSource;
let scriptUri;
function createWebviewPanel(uri) {
    vscode.debug.activeDebugConsole.append("ok");
    const panel = vscode.window.createWebviewPanel(
        'pdfViewer', // Internal identifier
        `PDF Viewer - ${uri.path.split('/').pop()}`, // Panel title
        vscode.ViewColumn.One, // Display in the editor column
        {
            enableScripts: true, // Enable JavaScript execution in the webview
        }
    );
    scriptUri = panel.webview.asWebviewUri(vscode.Uri.file("https://acrobat.adobe.com/embed-viewer/1.46.0/embed.js"))
    // HTML content for the Webview
    cspSource = panel.webview.cspSource 
    panel.webview.html = embed(uri);
    setTimeout(()=>{
        previewFile(fetchBuffer(uri));
    },1000);

}

function previewFile(previewPromise) {
    var adobeDCView = new global.window.AdobeDC.EmbedView({
        integrationName: "Onedrive",
        isEnterpriseEcoSystem: true,
        supportDarkMode: true,
        divId: "root",
        applicationVersion: "322.3232.32",
        releaseYear: 2020,
        analyticsInfo: {
            callingApp: "dc-embed-local"
        },
        helpUrl: "https://helpx.adobe.com/document-cloud/help/using-google-drive.html",
        imsClientId: "dc-local-embed-viewer",
        userVoiceConfig: {
            userVoiceKey: "6gNXXegDB6rtHARrNKRF8w",
            userVoiceForumId: "926557",
            userVoiceUrl: "https://acrobat.uservoice.com/forums/931921-adobe-acrobat-in-browsers",
        },
        persistence: "transient",
    });
    var previewPromise = adobeDCView.previewFile({
        content: { promise: previewPromise },
    });
}

function embed(uri) {

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src ${cspSource}; style-src ${cspSource};">
            <div id="logs"></div>
            <title>Adobe Embed Viewer</title>
            <script src="${scriptUri}"></script>

            
           
            </head>
        <body>
            <div id="pdfViewer"></div>
            <p>Processing PDF: ${uri.fsPath}</p>
            <div id="root" style="height: 100vh; width: 100vw;margin: 0 auto;"></div>
           
        </body>
        </html>
    `;
}

function deactivate() {}



module.exports = {
	activate,
	deactivate
}
