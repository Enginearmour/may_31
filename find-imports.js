import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to search for files recursively
function findFiles(dir, extensions) {
  let results = [];
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively search directories, but skip node_modules
      if (file !== 'node_modules') {
        results = results.concat(findFiles(filePath, extensions));
      }
    } else {
      // Check if file has one of the specified extensions
      const ext = path.extname(file).toLowerCase();
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  }
  
  return results;
}

// Function to check if a file contains a specific string
function fileContainsString(filePath, searchString) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes(searchString);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return false;
  }
}

// Main function to find files with incorrect imports
function findIncorrectImports() {
  const srcDir = path.join(__dirname, 'src');
  const extensions = ['.js', '.jsx'];
  
  // Find all JS and JSX files
  const allFiles = findFiles(srcDir, extensions);
  
  // Files to exclude from checking
  const excludeFiles = [
    path.join(__dirname, 'src/hooks/useAuth.js'),
    path.join(__dirname, 'src/App.jsx')
  ];
  
  // Search pattern for incorrect imports
  const incorrectImportPattern = "from '../contexts/AuthContext'";
  const useAuthPattern = "useAuth";
  
  // Find files with useAuth that might have incorrect imports
  const filesWithUseAuth = allFiles.filter(file => {
    if (excludeFiles.includes(file)) {
      return false;
    }
    return fileContainsString(file, useAuthPattern);
  });
  
  // Check which files have the incorrect import pattern
  const filesWithIncorrectImports = filesWithUseAuth.filter(file => 
    fileContainsString(file, incorrectImportPattern)
  );
  
  console.log('Files that might need to be updated:');
  filesWithIncorrectImports.forEach(file => {
    console.log(`- ${path.relative(__dirname, file)}`);
  });
  
  return filesWithIncorrectImports;
}

// Run the search
findIncorrectImports();
