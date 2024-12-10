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

function createWebviewPanel(uri) {
    const panel = vscode.window.createWebviewPanel(
        'pdfViewer', // Internal identifier
        `PDF Viewer - ${uri.path.split('/').pop()}`, // Panel title
        vscode.ViewColumn.One, // Display in the editor column
        {
            enableScripts: true, // Enable JavaScript execution in the webview
        }
    );

    // HTML content for the Webview
    panel.webview.html = embed(uri);

    setTimeout(() => {
        const previewPromise = fetchBuffer(uri);
        previewFile(previewPromise);
    },2000);
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
            <title>Adobe Embed Viewer</title>
            <script>
                const vscode = acquireVsCodeApi();
            </script>
            <script async src="https://acrobat.adobe.com/embed-viewer/1.46.0/embed.js"></script>
        </head>
        <body>
            <div id="root" style="height: 100vh; width: 100vw;margin: 0 auto;"></div>
            <p>Processing PDF: ${uri.fsPath}</p>
            <script>
               
            </script>
        </body>
        </html>
    `;
}

function deactivate() {}



module.exports = {
	activate,
	deactivate
}
