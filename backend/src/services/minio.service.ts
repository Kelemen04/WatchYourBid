import { Readable } from "stream";
import { minioClient } from "../db/minio";
import path from "path";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const bucket = process.env.MINIO_BUCKET || "watchyourbid";

export const minioService = {
    async uploadObjectToMinio(
        data: Buffer | Readable,
        objectName: string,
        mimeType: string,
        size?: number
    ) {
        const metaData = { "Content-Type": mimeType };

        if(!ALLOWED_MIME_TYPES.includes(mimeType)){
            throw new Error("Incorrect mime type!")
        }
        
        await minioClient.putObject(bucket, objectName, data, size, metaData);

        return {
            objectName,
            url: `http://localhost:9000/${bucket}/${objectName}`,
            path: `${objectName}`,
        };
    },
    async removeObjectFromMinio(
        objectName: string,
    ) {
        await minioClient.removeObject(bucket, objectName);

        return {
            message: "Profile picture removed from minio!"
        };
    },
    async removeObjectsFromMinio(
        objectName: string[],
    ) {
        await minioClient.removeObjects(bucket, objectName);

        return {
            message: "Pictures removed from minio!"
        };
    },
    async uploadAuctionFiles(auctionId: number, userId: number, files: Express.Multer.File[]) {
        
        const uploadPromises = files.map(async (file, index) => {
            const ext = path.extname(file.originalname);
            const objectName = `auctions/auction-${auctionId}/photo-${index}${ext}`;
            
            return await this.uploadObjectToMinio(file.buffer, objectName, file.mimetype, file.size);
        });

        return Promise.all(uploadPromises);
    },
    async uploadUserProfilePicture(userId: number, file: Express.Multer.File) {
        const ext = path.extname(file.originalname);
        const objectName = `users/user-${userId}/avatar${ext}`;
        
        return await this.uploadObjectToMinio(file.buffer, objectName, file.mimetype, file.size);
    },
    async deleteUserProfilePicture(userId: number,profilePictureUrl: string) {
        const objectName = profilePictureUrl.split(`${bucket}/`)[1];
        
        if(!objectName) return;

        return await this.removeObjectFromMinio(objectName);
    },
    async deleteAuctionPictures(userId: number,profilePictureUrl: string[]) {
        const objectNames = profilePictureUrl.map((p) => p.split(`${bucket}/`)[1]).filter((name): name is string => !!name);;
        
        if(objectNames.length === 0) return;

        return await this.removeObjectsFromMinio(objectNames);
    }
}