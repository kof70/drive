import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

const SERVER_URL = 'http://localhost:8080';

async function testFileUpload() {
  console.log('🧪 Test de l\'API de stockage de fichiers\n');

  try {
    // 1. Créer un fichier de test
    console.log('1️⃣ Création d\'un fichier de test...');
    const testFilePath = path.join(process.cwd(), 'test-file.txt');
    const testContent = 'Ceci est un fichier de test pour l\'upload.\nTimestamp: ' + new Date().toISOString();
    fs.writeFileSync(testFilePath, testContent);
    console.log('✅ Fichier créé:', testFilePath);

    // 2. Upload du fichier
    console.log('\n2️⃣ Upload du fichier...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('uploadedBy', 'test-script');

    const uploadResponse = await fetch(`${SERVER_URL}/api/files/upload`, {
      method: 'POST',
      body: formData as any,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log('✅ Fichier uploadé:', uploadResult);

    const storedFilename = uploadResult.data.storedPath;
    const fileId = path.parse(storedFilename).name;

    // 3. Récupérer les métadonnées
    console.log('\n3️⃣ Récupération des métadonnées...');
    const metadataResponse = await fetch(`${SERVER_URL}/api/files/metadata/${fileId}`);
    const metadataResult = await metadataResponse.json();
    console.log('✅ Métadonnées:', metadataResult);

    // 4. Lister tous les fichiers
    console.log('\n4️⃣ Liste de tous les fichiers...');
    const listResponse = await fetch(`${SERVER_URL}/api/files/list`);
    const listResult = await listResponse.json();
    console.log('✅ Nombre de fichiers:', listResult.data.length);

    // 5. Statistiques de stockage
    console.log('\n5️⃣ Statistiques de stockage...');
    const statsResponse = await fetch(`${SERVER_URL}/api/files/stats`);
    const statsResult = await statsResponse.json();
    console.log('✅ Stats:', statsResult);

    // 6. Vérification d'intégrité
    console.log('\n6️⃣ Vérification d\'intégrité...');
    const verifyResponse = await fetch(`${SERVER_URL}/api/files/verify/${storedFilename}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checksum: uploadResult.data.checksum }),
    });
    const verifyResult = await verifyResponse.json();
    console.log('✅ Intégrité:', verifyResult);

    // 7. Téléchargement du fichier
    console.log('\n7️⃣ Téléchargement du fichier...');
    const downloadResponse = await fetch(`${SERVER_URL}/api/files/download/${storedFilename}`);
    const downloadedContent = await downloadResponse.text();
    console.log('✅ Contenu téléchargé:', downloadedContent.substring(0, 50) + '...');

    // 8. Suppression du fichier
    console.log('\n8️⃣ Suppression du fichier...');
    const deleteResponse = await fetch(`${SERVER_URL}/api/files/${storedFilename}`, {
      method: 'DELETE',
    });
    const deleteResult = await deleteResponse.json();
    console.log('✅ Suppression:', deleteResult);

    // Nettoyer le fichier de test local
    fs.unlinkSync(testFilePath);
    console.log('\n✅ Tous les tests ont réussi !');

  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error);
    process.exit(1);
  }
}

// Vérifier que le serveur est démarré
async function checkServer() {
  try {
    const response = await fetch(`${SERVER_URL}/api/health`);
    if (response.ok) {
      console.log('✅ Serveur accessible\n');
      return true;
    }
  } catch (error) {
    console.error('❌ Serveur non accessible. Assurez-vous que le serveur est démarré avec "pnpm dev:server"');
    return false;
  }
  return false;
}

async function main() {
  const serverReady = await checkServer();
  if (serverReady) {
    await testFileUpload();
  } else {
    process.exit(1);
  }
}

main();
