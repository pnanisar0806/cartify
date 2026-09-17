export interface ReelRenderOptions {
  width: number;
  height: number;
  step: "idle" | "hook" | "typing" | "converting" | "results";
  title: string;
  isUrl?: boolean;
  input: string;
  displayText: string;
  ingredients: string[];
  caption: string;
  cursorVisible?: boolean;
}

/**
 * Helper to draw a rounded rectangle on a 2D canvas context
 */
export function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill = true,
  stroke = false
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

/**
 * Wrap text into lines that fit within maxWidth
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [text];
}

/**
 * Render a complete 9:16 high-definition video frame for the Reel
 */
export function renderReelFrame(
  ctx: CanvasRenderingContext2D,
  opts: ReelRenderOptions
) {
  const { width, height, step, isUrl, displayText, ingredients, caption, cursorVisible } = opts;

  // 1. Phone Bezel & Outer Background
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, width, height);

  // Phone inner body (30px inset with rounded corners)
  const phoneX = 16;
  const phoneY = 16;
  const phoneW = width - 32;
  const phoneH = height - 32;

  ctx.fillStyle = "#f6f9f7";
  drawRoundRect(ctx, phoneX, phoneY, phoneW, phoneH, 44, true, false);

  // Phone outer bezel border
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 6;
  drawRoundRect(ctx, phoneX, phoneY, phoneW, phoneH, 44, false, true);

  // 2. Status Bar
  ctx.fillStyle = "#64748b";
  ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("9:41", phoneX + 32, phoneY + 38);

  // Dynamic Island (Notch)
  ctx.fillStyle = "#0f172a";
  drawRoundRect(ctx, width / 2 - 65, phoneY + 16, 130, 28, 14, true, false);

  // 5G & Battery icon text
  ctx.fillStyle = "#64748b";
  ctx.textAlign = "right";
  ctx.fillText("5G 100%", phoneX + phoneW - 32, phoneY + 38);

  // 3. App Header Bar
  const headerY = phoneY + 54;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(phoneX, headerY, phoneW, 64);
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(phoneX, headerY + 64);
  ctx.lineTo(phoneX + phoneW, headerY + 64);
  ctx.stroke();

  // Logo Icon & Text
  ctx.fillStyle = "#047857";
  ctx.font = "900 26px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("🛒 Cartify.", phoneX + 24, headerY + 42);

  // Header Badge
  ctx.fillStyle = "#d1fae5";
  drawRoundRect(ctx, phoneX + phoneW - 170, headerY + 18, 146, 28, 14, true, false);
  ctx.fillStyle = "#065f46";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Instant Groceries", phoneX + phoneW - 97, headerY + 37);

  // 4. Content Area Title
  const contentY = headerY + 84;
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    isUrl ? "Recipe Link to Grocery Cart" : "Recipe to Grocery Cart",
    width / 2,
    contentY + 18
  );

  ctx.fillStyle = "#64748b";
  ctx.font = "15px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    "1-click search on Swiggy, Blinkit, Amazon Fresh & Amazon Now",
    width / 2,
    contentY + 44
  );

  // 5. Recipe Input Card
  const cardX = phoneX + 20;
  const cardY = contentY + 62;
  const cardW = phoneW - 40;
  const cardH = 220;

  ctx.fillStyle = "#ffffff";
  drawRoundRect(ctx, cardX, cardY, cardW, cardH, 20, true, false);
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1.5;
  drawRoundRect(ctx, cardX, cardY, cardW, cardH, 20, false, true);

  // Card Label
  ctx.fillStyle = "#334155";
  ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(isUrl ? "Recipe Web Link" : "What are you cooking?", cardX + 16, cardY + 28);

  if (isUrl) {
    ctx.fillStyle = "#047857";
    ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("🌐 Auto-extract", cardX + cardW - 16, cardY + 28);
  }

  // Inner Textarea Box
  const inputX = cardX + 14;
  const inputY = cardY + 40;
  const inputW = cardW - 28;
  const inputH = 96;

  ctx.fillStyle = "#fbfcfb";
  drawRoundRect(ctx, inputX, inputY, inputW, inputH, 12, true, false);
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1;
  drawRoundRect(ctx, inputX, inputY, inputW, inputH, 12, false, true);

  // Render typing text or placeholder
  ctx.font = "15px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.textAlign = "left";

  if (step === "idle" || step === "hook") {
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(isUrl ? "https://..." : "Paste recipe or ingredients...", inputX + 12, inputY + 28);
  } else {
    ctx.fillStyle = "#0f172a";
    const lines = wrapText(ctx, displayText, inputW - 24);
    lines.slice(0, 3).forEach((line, idx) => {
      ctx.fillText(line, inputX + 12, inputY + 26 + idx * 22);
    });

    if (step === "typing" && cursorVisible) {
      const lastLine = lines[lines.length - 1] || "";
      const textWidth = ctx.measureText(lastLine).width;
      const cursorX = inputX + 12 + textWidth + 2;
      const cursorY = inputY + 12 + (lines.length - 1) * 22;
      ctx.fillStyle = "#047857";
      ctx.fillRect(cursorX, cursorY, 3, 18);
    }
  }

  // Convert Button
  const btnX = inputX;
  const btnY = inputY + inputH + 14;
  const btnW = inputW;
  const btnH = 48;

  if (step === "converting") {
    ctx.fillStyle = "#065f46";
    drawRoundRect(ctx, btnX, btnY, btnW, btnH, 12, true, false);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✨ Extracting Groceries...", btnX + btnW / 2, btnY + 30);
  } else {
    ctx.fillStyle = "#047857";
    drawRoundRect(ctx, btnX, btnY, btnW, btnH, 12, true, false);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✨ Convert to Shopping Links", btnX + btnW / 2, btnY + 30);
  }

  // 6. Results Section
  const resultsY = cardY + cardH + 20;
  ctx.fillStyle = "#334155";
  ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Instant Shopping List", cardX, resultsY + 14);

  if (step === "results") {
    ctx.fillStyle = "#047857";
    ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${ingredients.length} items ready`, cardX + cardW, resultsY + 14);

    // Render ingredient items (up to 4 items in vertical space)
    const itemsToShow = ingredients.slice(0, 4);
    itemsToShow.forEach((item, i) => {
      const itemY = resultsY + 28 + i * 86;
      const itemH = 78;

      ctx.fillStyle = "#ffffff";
      drawRoundRect(ctx, cardX, itemY, cardW, itemH, 14, true, false);
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      drawRoundRect(ctx, cardX, itemY, cardW, itemH, 14, false, true);

      // Check circle
      ctx.fillStyle = "#d1fae5";
      ctx.beginPath();
      ctx.arc(cardX + 22, itemY + 22, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#047857";
      ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("✓", cardX + 22, itemY + 26);

      // Ingredient Name
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(item, cardX + 42, itemY + 27);

      // 4 Store Logos / Badges
      const storeWidth = (cardW - 40) / 4;
      const storeY = itemY + 44;
      const storeH = 24;

      // 1. Swiggy
      const s1X = cardX + 12;
      ctx.fillStyle = "#fff7ed";
      drawRoundRect(ctx, s1X, storeY, storeWidth, storeH, 6, true, false);
      ctx.strokeStyle = "#fed7aa";
      ctx.lineWidth = 1;
      drawRoundRect(ctx, s1X, storeY, storeWidth, storeH, 6, false, true);
      ctx.fillStyle = "#ea580c";
      ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Swiggy", s1X + storeWidth / 2, storeY + 17);

      // 2. Blinkit
      const s2X = s1X + storeWidth + 5;
      ctx.fillStyle = "#fef9c3";
      drawRoundRect(ctx, s2X, storeY, storeWidth, storeH, 6, true, false);
      ctx.strokeStyle = "#fde047";
      drawRoundRect(ctx, s2X, storeY, storeWidth, storeH, 6, false, true);
      ctx.fillStyle = "#854d0e";
      ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
      ctx.fillText("Blinkit", s2X + storeWidth / 2, storeY + 17);

      // 3. Amazon Fresh
      const s3X = s2X + storeWidth + 5;
      ctx.fillStyle = "#ecfdf5";
      drawRoundRect(ctx, s3X, storeY, storeWidth, storeH, 6, true, false);
      ctx.strokeStyle = "#a7f3d0";
      drawRoundRect(ctx, s3X, storeY, storeWidth, storeH, 6, false, true);
      ctx.fillStyle = "#065f46";
      ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
      ctx.fillText("Amz Fresh", s3X + storeWidth / 2, storeY + 17);

      // 4. Amazon Now
      const s4X = s3X + storeWidth + 5;
      ctx.fillStyle = "#f8fafc";
      drawRoundRect(ctx, s4X, storeY, storeWidth, storeH, 6, true, false);
      ctx.strokeStyle = "#cbd5e1";
      drawRoundRect(ctx, s4X, storeY, storeWidth, storeH, 6, false, true);
      ctx.fillStyle = "#334155";
      ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
      ctx.fillText("Amz Now", s4X + storeWidth / 2, storeY + 17);
    });
  } else {
    // Empty state placeholder
    const emptyY = resultsY + 28;
    const emptyH = 260;
    ctx.fillStyle = "#f8fafc";
    drawRoundRect(ctx, cardX, emptyY, cardW, emptyH, 16, true, false);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    drawRoundRect(ctx, cardX, emptyY, cardW, emptyH, 16, false, true);
    ctx.setLineDash([]);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "36px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🛒", width / 2, emptyY + 110);

    ctx.font = "16px system-ui, -apple-system, sans-serif";
    ctx.fillText("Store links will appear here", width / 2, emptyY + 160);
  }

  // 7. Dynamic TikTok / Reel Subtitle Overlay (Bottom of Video)
  if (caption) {
    const subtitleY = height - 140;
    const subtitleLines = wrapText(ctx, `🎙️ ${caption}`, width - 120);
    const subH = subtitleLines.length * 32 + 20;

    ctx.fillStyle = "rgba(0, 0, 0, 0.92)";
    drawRoundRect(ctx, 40, subtitleY, width - 80, subH, 22, true, false);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1.5;
    drawRoundRect(ctx, 40, subtitleY, width - 80, subH, 22, false, true);

    ctx.fillStyle = "#fde047"; // Yellow viral reel text
    ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    subtitleLines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, subtitleY + 28 + idx * 30);
    });
  }
}
