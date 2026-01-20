import { google } from 'googleapis';
import { Readable } from 'stream';

const SCOPES = ['https://www.googleapis.com/auth/drive'];

function getAuth() {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not defined');
  }

  let credentials;
  try {
    credentials = JSON.parse(serviceAccountJson);
  } catch (e) {
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
  const auth = getAuth();
  return google.drive({ version: 'v3', auth });
}

export async function listArchiveFolders() {
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
}

export async function getFolderDetails(folderId) {
  const drive = await getDriveClient();
  
  // List files inside the specific comparison folder
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, webContentLink, size)',
  });
  
  return res.data.files || [];
}

export async function uploadFileToInput(fileObject) {
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
}

export async function getFileStream(fileId) {
  const drive = await getDriveClient();
  const res = await drive.files.get({
    fileId: fileId,
    alt: 'media',
  }, { responseType: 'stream' });
  
  return res.data;
}

export async function getFileText(fileId) {
  const drive = await getDriveClient();
  const res = await drive.files.get({
    fileId: fileId,
    alt: 'media',
  }, { responseType: 'text' });
  
  return res.data; // String content
}
