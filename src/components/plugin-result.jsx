import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { AlertCircle, CheckCircle2, Download, FileDown, Copy, Save } from 'lucide-react';

export function PluginResult({ plugin }) {
  const [activeTab, setActiveTab] = useState('preview');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState(null); // 'success', 'error', or null
  const [errorMessage, setErrorMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [textContent, setTextContent] = useState('');
  const downloadLinkRef = useRef(null);
  
  // Generate text content for direct download
  useEffect(() => {
    if (plugin) {
      let content = `# ${plugin.name}\n\n`;
      content += `${plugin.description}\n\n`;
      content += `## Main Plugin File (${plugin.slug}.php)\n\`\`\`php\n${plugin.mainFile}\n\`\`\`\n\n`;
      
      if (plugin.additionalFiles) {
        Object.entries(plugin.additionalFiles).forEach(([path, fileContent]) => {
          content += `## ${path}\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
        });
      }
      
      setTextContent(content);
    }
  }, [plugin]);
  
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setDownloadStatus(null);
      setErrorMessage('');
      setDebugInfo('Starting download process...\n');
      
      // Method 1: Direct text file download (most compatible)
      try {
        setDebugInfo(prev => prev + 'Attempting direct text file download...\n');
        
        // Create text content with all plugin files
        const textBlob = new Blob([textContent], { type: 'text/plain' });
        const textUrl = URL.createObjectURL(textBlob);
        
        if (downloadLinkRef.current) {
          downloadLinkRef.current.href = textUrl;
          downloadLinkRef.current.download = `${plugin.slug}-files.txt`;
          downloadLinkRef.current.click();
          setDebugInfo(prev => prev + 'Text download link clicked\n');
        }
        
        // Clean up
        setTimeout(() => {
          URL.revokeObjectURL(textUrl);
          setDebugInfo(prev => prev + 'Text URL revoked\n');
        }, 100);
      } catch (textError) {
        setDebugInfo(prev => prev + `Text download error: ${textError.message}\n`);
      }
      
      // Method 2: Try ZIP download
      try {
        setDebugInfo(prev => prev + 'Attempting ZIP file creation...\n');
        
        // Create a new JSZip instance
        const zip = new JSZip();
        setDebugInfo(prev => prev + 'JSZip instance created\n');
        
        // Create the main folder
        const folder = zip.folder(plugin.slug);
        setDebugInfo(prev => prev + `Created folder: ${plugin.slug}\n`);
        
        // Add main plugin file
        folder.file(`${plugin.slug}.php`, plugin.mainFile);
        setDebugInfo(prev => prev + `Added main file: ${plugin.slug}.php\n`);
        
        // Add additional files
        if (plugin.additionalFiles && typeof plugin.additionalFiles === 'object') {
          Object.entries(plugin.additionalFiles).forEach(([path, content]) => {
            folder.file(path, content);
            setDebugInfo(prev => prev + `Added additional file: ${path}\n`);
          });
        } else {
          setDebugInfo(prev => prev + 'No additional files found or additionalFiles is not an object\n');
        }
        
        // Generate the zip file
        setDebugInfo(prev => prev + 'Generating ZIP file...\n');
        const content = await zip.generateAsync({ 
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 9 }
        });
        
        setDebugInfo(prev => prev + `ZIP file generated successfully. Size: ${content.size} bytes\n`);
        
        // Try to download using FileSaver
        try {
          setDebugInfo(prev => prev + 'Attempting download with FileSaver.js...\n');
          saveAs(content, `${plugin.slug}.zip`);
          setDebugInfo(prev => prev + 'FileSaver.js download initiated\n');
        } catch (saveAsError) {
          setDebugInfo(prev => prev + `FileSaver.js error: ${saveAsError.message}\n`);
        }
      } catch (zipError) {
        setDebugInfo(prev => prev + `ZIP creation error: ${zipError.message}\n`);
      }
      
      setDebugInfo(prev => prev + 'Download process completed\n');
      setDownloadStatus('success');
    } catch (error) {
      console.error('Error in download process:', error);
      setDownloadStatus('error');
      setErrorMessage(error.message || 'Unknown error occurred');
      setDebugInfo(prev => prev + `Error in download process: ${error.message}\n`);
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(textContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const handleSaveToProjects = () => {
    setIsSaving(true);
    
    // Simulate saving to projects
    setTimeout(() => {
      // Save plugin to localStorage for demonstration
      try {
        const savedPlugins = JSON.parse(localStorage.getItem('savedPlugins') || '[]');
        savedPlugins.push({
          id: Date.now(),
          name: plugin.name,
          slug: plugin.slug,
          type: plugin.type,
          description: plugin.description,
          savedAt: new Date().toISOString()
        });
        localStorage.setItem('savedPlugins', JSON.stringify(savedPlugins));
        setSaveStatus('success');
      } catch (error) {
        console.error('Error saving plugin:', error);
        setSaveStatus('error');
      }
      
      setIsSaving(false);
    }, 1000);
  };
  
  // Validate plugin object structure
  const isValidPlugin = plugin && 
                        plugin.slug && 
                        plugin.name && 
                        plugin.mainFile;
  
  if (!isValidPlugin) {
    console.error('Invalid plugin object:', plugin);
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
        <h3 className="text-lg font-medium">Error: Invalid Plugin Data</h3>
        <p>The plugin data is incomplete or invalid. Please try generating the plugin again.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Hidden download link for text file */}
      <a 
        ref={downloadLinkRef} 
        style={{ display: 'none' }} 
        href="#" 
        download={`${plugin.slug}-files.txt`}
      >
        Download
      </a>
      
      <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-800">
        <h3 className="text-lg font-medium">Plugin Generated Successfully!</h3>
        <p className="mt-1">Your WordPress plugin "{plugin.name}" is ready to download and install.</p>
      </div>
      
      {downloadStatus === 'success' && (
        <div className="flex items-center p-4 mb-4 bg-green-50 border border-green-200 rounded-md">
          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
          <div>
            <p className="font-medium text-green-800">Download initiated!</p>
            <p className="text-green-700 text-sm">
              If the ZIP file didn't download, a text file with all code should have downloaded instead.
            </p>
            <p className="text-green-700 text-sm mt-1">
              You can also copy all code using the "Copy All Code" button below.
            </p>
          </div>
        </div>
      )}
      
      {downloadStatus === 'error' && (
        <div className="flex items-center p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <div>
            <p className="font-medium text-red-800">Download failed</p>
            <p className="text-red-700 text-sm">{errorMessage || 'An error occurred during download. Please try again.'}</p>
          </div>
        </div>
      )}
      
      {saveStatus === 'success' && (
        <div className="flex items-center p-4 mb-4 bg-green-50 border border-green-200 rounded-md">
          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
          <div>
            <p className="font-medium text-green-800">Saved to My Projects!</p>
            <p className="text-green-700 text-sm">
              You can access this plugin anytime from your projects dashboard.
            </p>
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={handleDownload} 
          className="flex-1 flex items-center justify-center gap-2"
          disabled={isDownloading}
        >
          <Download className="h-4 w-4" />
          {isDownloading ? 'Creating Download...' : 'Download Plugin'}
        </Button>
        
        <Button 
          variant="secondary" 
          className="flex-1 flex items-center justify-center gap-2"
          onClick={handleCopyCode}
        >
          <Copy className="h-4 w-4" />
          {copied ? 'Copied!' : 'Copy All Code'}
        </Button>
        
        <Button 
          variant="outline" 
          className="flex-1 flex items-center justify-center gap-2"
          onClick={handleSaveToProjects}
          disabled={isSaving}
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save to My Projects'}
        </Button>
      </div>
      
      <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
        <p>
          <strong>Note:</strong> If you're having trouble with the download, we've provided multiple options:
        </p>
        <ol className="list-decimal pl-5 mt-1">
          <li>The "Download Plugin" button will attempt to download a ZIP file or a text file with all code.</li>
          <li>The "Copy All Code" button will copy all plugin code to your clipboard.</li>
          <li>The "Save to My Projects" button will save this plugin to your account for later access.</li>
        </ol>
        <p className="mt-2">
          <strong>Troubleshooting:</strong> If downloads aren't working, your browser might be blocking them. Try:
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>Checking for download notifications near your browser's address bar</li>
          <li>Disabling download blockers or security extensions</li>
          <li>Using the "Copy All Code" option instead</li>
        </ul>
        <button 
          onClick={() => setShowDebug(!showDebug)} 
          className="text-blue-600 hover:underline mt-2"
        >
          {showDebug ? 'Hide' : 'Show'} Technical Details
        </button>
        
        {showDebug && (
          <div className="mt-2 relative">
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
              {debugInfo}
            </pre>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(debugInfo);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="absolute top-2 right-2 bg-white p-1 rounded shadow"
              title="Copy debug info"
            >
              <Copy size={14} />
              {copied && <span className="absolute -top-6 right-0 text-xs bg-black text-white p-1 rounded">Copied!</span>}
            </button>
          </div>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="p-4 border rounded-md mt-2">
          <div className="prose max-w-none">
            <h3>Plugin Details</h3>
            <ul>
              <li><strong>Name:</strong> {plugin.name}</li>
              <li><strong>Type:</strong> {plugin.type}</li>
              <li><strong>Description:</strong> {plugin.description}</li>
            </ul>
            
            <h3>Features</h3>
            <ul>
              {plugin.features && plugin.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="code" className="mt-2">
          <div className="border rounded-md overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 text-sm font-medium border-b">
              {plugin.slug}.php
            </div>
            <pre className="p-4 overflow-auto text-sm bg-gray-50 max-h-[400px]">
              <code>{plugin.mainFile}</code>
            </pre>
          </div>
          
          {plugin.additionalFiles && Object.entries(plugin.additionalFiles).map(([path, content]) => (
            <div key={path} className="border rounded-md overflow-hidden mt-4">
              <div className="bg-gray-100 px-4 py-2 text-sm font-medium border-b">
                {path}
              </div>
              <pre className="p-4 overflow-auto text-sm bg-gray-50 max-h-[400px]">
                <code>{content}</code>
              </pre>
            </div>
          ))}
        </TabsContent>
        
        <TabsContent value="instructions" className="p-4 border rounded-md mt-2">
          <div className="prose max-w-none">
            <h3>Installation Instructions</h3>
            <ol>
              <li>Download the plugin ZIP file using the "Download Plugin" button above.</li>
              <li>Log in to your WordPress admin dashboard.</li>
              <li>Navigate to Plugins → Add New → Upload Plugin.</li>
              <li>Choose the downloaded ZIP file and click "Install Now".</li>
              <li>After installation completes, click "Activate Plugin".</li>
            </ol>
            
            <h3>Usage Instructions</h3>
            <div dangerouslySetInnerHTML={{ __html: plugin.instructions || '' }} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
