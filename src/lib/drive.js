import { google } from 'googleapis';
import { Readable } from 'stream';

const SCOPES = ['https://www.googleapis.com/auth/drive'];

function getAuth() {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    console.error("CRITICAL ERROR: GOOGLE_SERVICE_ACCOUNT_JSON is empty or undefined!");
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not defined');
  }

  let credentials;
  try {
    credentials = JSON.parse(serviceAccountJson);
  } catch (e) {
    console.error("CRITICAL ERROR: Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON. Check JSON format in Coolify.", e.message);
    throw new Error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON');
  }

  // Use GoogleAuth which is more robust for service accounts
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  return auth;
}

export async function getDriveClient() {
  try {
    const auth = getAuth();
    // Explicitly await the client client if necessary, but passing auth to drive() works for GoogleAuth
    const drive = google.drive({ version: 'v3', auth });
    return drive;
  } catch (e) {
    console.error('Error initializing Drive client:', e);
    throw e;
  }
}

export async function listArchiveFolders() {
  try {
    const drive = await getDriveClient();
    const folderId = process.env.DRIVE_FOLDER_ID_ARCHIVE;
    if (!folderId) throw new Error('DRIVE_FOLDER_ID_ARCHIVE is not defined');

    // List folders inside the archive folder
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime desc',
    });

    return res.data.files || [];
  } catch (e) {
    console.error('Google Drive List Error (listArchiveFolders):', e.message, e.response?.data);
    throw e;
  }
}

export async function getFolderDetails(folderId) {
  try {
    const drive = await getDriveClient();

    // List files inside the specific comparison folder
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, webContentLink, size)',
    });

    return res.data.files || [];
  } catch (e) {
    console.error(`Google Drive Details Error (getFolderDetails) for ID ${folderId}:`, e.message, e.response?.data);
    throw e;
  }
}

export async function uploadFileToInput(fileObject) {
  try {
    // fileObject: { name, buffer, type }
    const drive = await getDriveClient();
    // User requested explicit ID for this fix
    const folderId = '1wNav_xCSYcQX5-BQgINN7vb9L8FcbkQu';

    // Create a generic stream from validity
    const stream = new Readable();
    stream.push(fileObject.buffer);
    stream.push(null);

    const fileMetadata = {
      name: fileObject.name,
      parents: [folderId],
    };

    const media = {
      mimeType: fileObject.type || 'application/pdf',
      body: stream,
    };

    console.log(`Uploading file: ${fileObject.name} (${fileObject.buffer.length} bytes) to folder ${folderId}`);

    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name',
    });

    return res.data;
  } catch (e) {
    console.error('Google Drive Upload Error (uploadFileToInput):', e.message);
    if (e.response && e.response.data) {
      console.error('Detailed Google API Error Response:', JSON.stringify(e.response.data, null, 2));
    }
    throw e;
  }
}

export async function getFileStream(fileId) {
  try {
    const drive = await getDriveClient();
    const res = await drive.files.get({
      fileId: fileId,
      alt: 'media',
    }, { responseType: 'stream' });

    return res.data;
  } catch (e) {
    console.error(`Google Drive Stream Error (getFileStream) for ID ${fileId}:`, e.message);
    throw e;
  }
}

export async function getFileText(fileId) {
  try {
    const drive = await getDriveClient();
    const res = await drive.files.get({
      fileId: fileId,
      alt: 'media',
    }, { responseType: 'text' });

    return res.data; // String content
  } catch (e) {
    console.error(`Google Drive Text Error (getFileText) for ID ${fileId}:`, e.message);
    throw e;
  }
}

export async function getComparisons(folderId) {
  try {
    const files = await getFolderDetails(folderId);

    const folders = files.filter(f => f.mimeType === 'application/vnd.google-apps.folder');

    // Parse comparisons
    // Pattern: "Compare [RevA] - [RevB].html"
    const compareRegex = /^Compare\s+(.+?)\s+-\s+(.+?)\.html$/i;

    const comparisons = [];
    const htmlFiles = files.filter(f => f.mimeType !== 'application/vnd.google-apps.folder' && f.name.toLowerCase().endsWith('.html'));

    // Create a lookup for PDFs to avoid O(N^2)
    // Map filename -> file object
    const fileMap = new Map();
    files.forEach(f => {
      // Store exact name case-insensitive
      fileMap.set(f.name.toLowerCase(), f);
    });

    for (const file of htmlFiles) {
      const match = file.name.match(compareRegex);
      if (match) {
        const revA = match[1].trim();
        const revB = match[2].trim();

        // Find corresponding PDFs
        // Assumption: PDF name is exactly "[Rev].pdf" OR just "[Rev]" case-insensitive
        // Try with extension first, then without
        const pdfA = fileMap.get(`${revA}.pdf`.toLowerCase()) || fileMap.get(revA.toLowerCase());
        const pdfB = fileMap.get(`${revB}.pdf`.toLowerCase()) || fileMap.get(revB.toLowerCase());

        if (pdfA && pdfB) {
          comparisons.push({
            type: 'comparison',
            id: file.id, // HTML File ID
            name: `Sammenligning: Rev ${revA} mod Rev ${revB}`,
            htmlFile: file,
            pdfA: pdfA,
            pdfB: pdfB,
            revA,
            revB
          });
        } else {
          // Partial match or missing PDF? 
          // We can still list it but maybe indicate missing data.
          // For now, strict requirement: "Fetch these PDFs ... using their specific IDs"
          // If missing, maybe better to exclude or mark invalid.
          // I'll include it but with nulls so UI can handle error.
          comparisons.push({
            type: 'comparison',
            id: file.id,
            name: `Sammenligning: Rev ${revA} mod Rev ${revB} (Incomplete)`,
            htmlFile: file,
            pdfA: pdfA || null,
            pdfB: pdfB || null,
            revA,
            revB
          });
        }
      }
    }

    return { folders, comparisons };

  } catch (e) {
    console.error("Error parsing comparisons for folder", folderId, e);
    throw e;
  }
}
