// This is a test script to verify the JSZip and FileSaver functionality
// You can run this with Node.js to check if the libraries work correctly

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Mock browser environment for testing
global.Blob = class Blob {
  constructor(content, options) {
    this.content = content;
    this.options = options;
    console.log('Blob created with content length:', content[0].length);
  }
};

// Test function
async function testZipCreation() {
  try {
    console.log('Creating test ZIP file...');
    
    // Create a new JSZip instance
    const zip = new JSZip();
    
    // Add some test files
    zip.file('test-plugin/main.php', '<?php echo "Hello World"; ?>');
    zip.file('test-plugin/readme.txt', 'This is a test readme file');
    
    // Create a subfolder
    const folder = zip.folder('test-plugin/includes');
    folder.file('functions.php', '<?php function test() { return true; } ?>');
    
    // Generate the zip content
    console.log('Generating ZIP content...');
    const content = await zip.generateAsync({ type: 'blob' });
    
    console.log('ZIP file generated successfully!');
    console.log('ZIP content type:', content.options.type);
    console.log('ZIP content size:', content.content[0].length, 'bytes');
    
    // In a browser, this would trigger a download
    // saveAs(content, 'test-plugin.zip');
    
    return true;
  } catch (error) {
    console.error('Error in ZIP creation test:', error);
    return false;
  }
}

// Run the test
testZipCreation()
  .then(success => {
    console.log('Test completed. Success:', success);
  })
  .catch(error => {
    console.error('Test failed with error:', error);
  });
