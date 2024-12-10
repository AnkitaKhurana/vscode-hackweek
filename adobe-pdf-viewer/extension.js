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
}

function embed(uri) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Adobe Embed Viewer</title>
        </head>
        <body>
            <h1>PDF Viewer</h1>
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
