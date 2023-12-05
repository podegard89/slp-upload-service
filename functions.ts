import { SlippiGame } from "@slippi/slippi-js";
import fs from "fs";
import path from "path";

export function extractDataFromSlippiFiles(files: Express.Multer.File[]) {
  const games = files.map((file) => new SlippiGame(file.path));

  const validGames = games.filter((game) => {
    const settings = game.getSettings();
    const metadata = game.getMetadata();
    const stats = game.getStats();

    // gameMode 8 means online
    return settings && metadata && stats && settings.gameMode === 8;
  });

  return validGames.map((game) => {
    const settings = game.getSettings();
    const metadata = game.getMetadata();
    const stats = game.getStats();

    const player1Meta = metadata!.players![0];
    const player2Meta = metadata!.players![1];

    const player1Settings = settings!.players![0];
    const player2Settings = settings!.players![1];

    // creating my own match code since there are many games that don't have a match id
    return {
      matchCode:
        settings!.matchInfo?.matchId ||
        `mode.${settings!.gameMode}-${metadata?.startAt!}-${player1Meta.names!
          .code!}-${player2Meta.names!.code!}`,
      player1: player1Meta.names!.code!,
      player2: player2Meta.names!.code!,
      player1Character: player1Settings.characterId,
      player2Character: player2Settings.characterId,
      player1Overalls: stats!.overall[0],
      player2Overalls: stats!.overall[1],
    };
  });
}

export function clearUploadsFolder() {
  const uploadsFolderPath = path.join(__dirname, "uploads");
  try {
    const files = fs.readdirSync(uploadsFolderPath);

    files.forEach((file) => {
      const filePath = path.join(uploadsFolderPath, file);
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${filePath}`);
    });

    console.log("Uploads folder cleared successfully.");
  } catch (error) {
    console.error("Error clearing uploads folder:", error);
  }
}
