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

// Function to check file content for specific imports
function checkFileImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for useAuth import from AuthContext
    const incorrectImportRegex = /import\s+[^;]*\{\s*[^}]*useAuth[^}]*\}\s+from\s+['"]\.\.?\/contexts\/AuthContext['"]/;
    const hasIncorrectImport = incorrectImportRegex.test(content);
    
    // Check for any import from AuthContext
    const anyAuthContextImport = /from\s+['"]\.\.?\/contexts\/AuthContext['"]/;
    const importsFromAuthContext = anyAuthContextImport.test(content);
    
    // Check if file contains useAuth usage
    const usesAuth = content.includes('useAuth');
    
    return {
      path: filePath,
      relativePath: path.relative(__dirname, filePath),
      hasIncorrectImport,
      importsFromAuthContext,
      usesAuth,
      content: content
    };
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return {
      path: filePath,
      relativePath: path.relative(__dirname, filePath),
      error: error.message
    };
  }
}

// Main function
function analyzeImports() {
  const srcDir = path.join(__dirname, 'src');
  const extensions = ['.js', '.jsx'];
  
  // Find all JS and JSX files
  const allFiles = findFiles(srcDir, extensions);
  
  // Analyze each file
  const fileAnalysis = allFiles.map(checkFileImports);
  
  // Filter for files with potential issues
  const filesWithIssues = fileAnalysis.filter(file => 
    file.hasIncorrectImport || (file.usesAuth && file.importsFromAuthContext)
  );
  
  console.log('Files that need to be updated:');
  filesWithIssues.forEach(file => {
    console.log(`- ${file.relativePath}`);
    if (file.hasIncorrectImport) {
      console.log('  Has incorrect useAuth import from AuthContext');
    }
    if (file.usesAuth && file.importsFromAuthContext) {
      console.log('  Uses useAuth and imports from AuthContext');
    }
  });
  
  // Also check for files that might be loaded at the root route
  console.log('\nFiles that might be loaded at the root route:');
  const rootRouteFiles = fileAnalysis.filter(file => 
    file.relativePath.includes('Dashboard') || 
    file.relativePath.includes('Layout') ||
    file.relativePath.includes('components/') ||
    file.relativePath.includes('pages/')
  );
  
  rootRouteFiles.forEach(file => {
    if (file.importsFromAuthContext) {
      console.log(`- ${file.relativePath} (imports from AuthContext)`);
    }
  });
  
  return { filesWithIssues, rootRouteFiles };
}

// Run the analysis
analyzeImports();
