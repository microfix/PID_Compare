import { google } from 'googleapis';
import { Readable } from 'stream';

const SCOPES = ['https://www.googleapis.com/auth/drive'];

function getAuth() {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    console.error('GOOGLE_SERVICE_ACCOUNT_JSON is missing');
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not defined');
  }

  let credentials;
  try {
    credentials = JSON.parse(serviceAccountJson);
  } catch (e) {
    console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', e.message);
    throw new Error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON. Ensure it is valid JSON.');
  }

  return new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    SCOPES
  );
}

export async function getDriveClient() {
  try {
    const auth = getAuth();
    return google.drive({ version: 'v3', auth });
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
    const folderId = process.env.DRIVE_FOLDER_ID_INPUT;
    if (!folderId) throw new Error('DRIVE_FOLDER_ID_INPUT is not defined');

    const stream = new Readable();
    stream.push(fileObject.buffer);
    stream.push(null);

    const fileMetadata = {
      name: fileObject.name,
      parents: [folderId],
    };

    const media = {
      mimeType: fileObject.type,
      body: stream,
    };

    const res = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name',
    });

    return res.data;
  } catch (e) {
    console.error('Google Drive Upload Error (uploadFileToInput):', e.message, e.response?.data);
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
