const { Octokit } = require("@octokit/rest");
const fs = require('fs').promises;
const path = require('path');

const GITHUB_TOKEN = 'YOUR_PERSONAL_ACCESS_TOKEN';
const REPO_NAME = 'linkedin-carousel-generator';
const OWNER = 'YOUR_GITHUB_USERNAME';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function createRepo() {
  try {
    const response = await octokit.repos.createForAuthenticatedUser({
      name: REPO_NAME,
      private: false, // Set to true if you want a private repo
    });
    console.log(`Repository created: ${response.data.html_url}`);
    return response.data;
  } catch (error) {
    console.error('Error creating repository:', error.message);
    process.exit(1);
  }
}

async function uploadFile(filePath, repoData) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const response = await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO_NAME,
      path: path.relative(process.cwd(), filePath),
      message: `Add ${path.basename(filePath)}`,
      content: Buffer.from(content).toString('base64'),
      branch: 'main',
    });
    console.log(`File uploaded: ${filePath}`);
  } catch (error) {
    console.error(`Error uploading file ${filePath}:`, error.message);
  }
}

async function uploadDirectory(dirPath, repoData) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (let entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await uploadDirectory(fullPath, repoData);
    } else {
      await uploadFile(fullPath, repoData);
    }
  }
}

async function main() {
  const repoData = await createRepo();
  await uploadDirectory(process.cwd(), repoData);
  console.log('All files uploaded successfully!');
}

main().catch(console.error);