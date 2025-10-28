import path from "path";
import fs from "fs";
export async function downloadFile(url, dest = './temp') {
    const fileName = path.basename(new URL(url).pathname);
    const filePath = path.join(dest, fileName);

    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true }); //tạo 

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Không tải được file (${res.status})`);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));
    return filePath;
}