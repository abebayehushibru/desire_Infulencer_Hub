package com.example

import android.os.Bundle
import android.widget.Toast
import android.graphics.pdf.PdfDocument
import android.graphics.Paint
import android.graphics.Color as AndroidColor
import android.widget.VideoView
import android.widget.MediaController
import androidx.compose.ui.viewinterop.AndroidView
import android.os.Environment
import androidx.compose.animation.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale
import androidx.compose.foundation.interaction.MutableInteractionSource

import com.example.ui.theme.*
import androidx.compose.ui.graphics.Brush

// ---------------------- 2. CAMPAIGNS LIST SCREEN ----------------------
@Composable
fun CampaignsListScreen(
    campaigns: List<Campaign>,
    onSelectCampaign: (String) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategoryFilter by remember { mutableStateOf("All") }

    val categories = listOf("All", "Sales", "Awareness", "Growth")

    val filteredCampaigns = campaigns.filter { campaign ->
        val matchesSearch = campaign.title.contains(searchQuery, ignoreCase = true) ||
                campaign.brandName.contains(searchQuery, ignoreCase = true)
        val matchesCategory = selectedCategoryFilter == "All" || campaign.category == selectedCategoryFilter
        matchesSearch && matchesCategory
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Transparent)
            .statusBarsPadding()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        // Search & Filter header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search campaigns...", color = Color(0xFF5F5C8C).copy(alpha = 0.6f), fontSize = 14.sp) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TelegramBlue) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White,
                    focusedBorderColor = TelegramBlue,
                    unfocusedBorderColor = Color(0xFFCBD5E1),
                    focusedTextColor = MidnightIndigo,
                    unfocusedTextColor = MidnightIndigo
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.weight(1f),
                singleLine = true
            )

            IconButton(
                onClick = { /* Toggle filters */ },
                modifier = Modifier
                    .background(MidnightIndigo, RoundedCornerShape(12.dp))
                    .size(48.dp)
            ) {
                Icon(Icons.Default.FilterList, contentDescription = "Filter", tint = Color.White)
            }
        }

        // Horizontal Category Tabs with soft blue/neutral pill indicators
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            categories.forEach { category ->
                val isSelected = selectedCategoryFilter == category
                val bgColor = if (isSelected) TelegramBlue else Color.White.copy(alpha = 0.1f)
                val textColor = if (isSelected) Color.White else Color.White.copy(alpha = 0.7f)

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(20.dp))
                        .background(bgColor)
                        .clickable { selectedCategoryFilter = category }
                        .padding(vertical = 10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = category.uppercase(Locale.getDefault()),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = textColor
                    )
                }
            }
        }

        // Main Campaign List view
        if (filteredCampaigns.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text(text = "No campaigns matched your filters.", color = Color.White.copy(alpha = 0.6f), fontSize = 14.sp)
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredCampaigns) { campaign ->
                    val cardInteractionSource = remember { MutableInteractionSource() }
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .liftOnInteraction(cardInteractionSource)
                            .tactileScale(cardInteractionSource)
                            .clickable(
                                interactionSource = cardInteractionSource,
                                indication = androidx.compose.foundation.LocalIndication.current
                            ) { onSelectCampaign(campaign.id) },
                        colors = CardDefaults.cardColors(containerColor = Color(0x1AFFFFFF)),
                        shape = RoundedCornerShape(16.dp),
                        border = BorderStroke(0.5.dp, Color.White.copy(alpha = 0.15f)),
                        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = if (campaign.category == "Sales") Icons.Default.TrendingUp else Icons.Default.Campaign,
                                        contentDescription = null,
                                        tint = TelegramBlue,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "${campaign.category} Campaign",
                                        style = MaterialTheme.typography.labelMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White.copy(alpha = 0.7f)
                                    )
                                }

                                Text(
                                    text = campaign.status.uppercase(Locale.getDefault()),
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = when (campaign.status) {
                                        "Open" -> TelegramBlue
                                        "Claimed" -> TelegramBlue
                                        else -> Color.White.copy(alpha = 0.6f)
                                    }
                                )
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            Text(
                                text = campaign.title,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )

                            Spacer(modifier = Modifier.height(4.dp))

                            Text(
                                text = "by ${campaign.brandName}",
                                fontSize = 11.sp,
                                color = Color.White.copy(alpha = 0.7f)
                             )

                            Spacer(modifier = Modifier.height(14.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = "Earn per conversion",
                                        fontSize = 11.sp,
                                        color = Color.White.copy(alpha = 0.7f)
                                    )
                                    Text(
                                        text = Formatters.formatCurrency(campaign.rewardAmount),
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                }

                                Button(
                                    onClick = { onSelectCampaign(campaign.id) },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (campaign.status == "Open") TelegramBlue else Color.White.copy(alpha = 0.15f),
                                        contentColor = if (campaign.status == "Open") Color.White else Color.White
                                    ),
                                    shape = RoundedCornerShape(8.dp),
                                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                                ) {
                                    Text(
                                        text = if (campaign.status == "Open") "Claim" else "View",
                                        style = MaterialTheme.typography.labelLarge
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}


// ---------------------- 3. CAMPAIGN DETAILS / WORKSPACE SCREEN ----------------------
@Composable
fun CampaignDetailsWorkspaceScreen(
    campaign: Campaign,
    submissions: MutableList<ContentSubmission>,
    chatMessages: MutableList<ChatMessage>,
    onBack: () -> Unit,
    onClaim: () -> Unit
) {
    var subTab by remember { mutableStateOf(CampaignSubTab.OVERVIEW) }
    val context = LocalContext.current

    Column(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .background(MidnightIndigo)
                            ) {
                                // Custom Back Header View
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(MidnightIndigo)
                                        .padding(horizontal = 8.dp, vertical = 12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    IconButton(onClick = onBack) {
                                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                                    }

                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = campaign.title,
                                            fontSize = 16.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                        Text(
                                            text = campaign.brandName,
                                            fontSize = 11.sp,
                                            color = TelegramBlue
                                        )
                                    }
                                }

        // Custom Tab Row matching blueprint image: a rounded horizontal card/row floating on a light background with an active sliding tracker underline
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            shape = RoundedCornerShape(12.dp),
            border = BorderStroke(1.dp, Color(0xFFE2E8F0))
        ) {
            val tabs = CampaignSubTab.values()
            val selectedIndex = tabs.indexOf(subTab)
            
            TabRow(
                selectedTabIndex = selectedIndex,
                containerColor = Color.White,
                contentColor = TelegramBlue,
                indicator = { tabPositions ->
                    TabRowDefaults.SecondaryIndicator(
                        modifier = Modifier.tabIndicatorOffset(tabPositions[selectedIndex]),
                        color = TelegramBlue
                    )
                },
                divider = {}
            ) {
                tabs.forEach { tab ->
                    val isSelected = subTab == tab
                    Tab(
                        selected = isSelected,
                        onClick = { subTab = tab },
                        text = {
                            Text(
                                text = when (tab) {
                                    CampaignSubTab.OVERVIEW -> "OVERVIEW"
                                    CampaignSubTab.CAMPAIGNS -> "CONTENT"
                                    CampaignSubTab.STATISTICS -> "STATISTICS"
                                    CampaignSubTab.REVIEWS -> "CHAT"
                                },
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) TelegramBlue else Color(0xFF5F5C8C),
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    )
                }
            }
        }

        // Render Current workspace child view
        Box(modifier = Modifier.weight(1f)) {
            when (subTab) {
                CampaignSubTab.OVERVIEW -> CampaignWorkspaceOverviewTab(campaign, onClaim)
                CampaignSubTab.CAMPAIGNS -> CampaignWorkspaceContentTab(campaign, submissions)
                CampaignSubTab.STATISTICS -> CampaignWorkspaceEarningsTab(campaign)
                CampaignSubTab.REVIEWS -> CampaignWorkspaceChatTab(chatMessages)
            }
        }
    }
}

@Composable
fun CampaignWorkspaceOverviewTab(campaign: Campaign, onClaim: () -> Unit) {
    val context = LocalContext.current
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Sales Campaign",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF2E1C8D)
                        )

                        Box(
                            modifier = Modifier
                                .background(Color(0xFFE6F4EA), RoundedCornerShape(4.dp))
                                .padding(horizontal = 8.dp, vertical = 2.dp)
                        ) {
                            Text(text = "ACTIVE", color = Color(0xFF137333), style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "Earn 500 ETB per conversion",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color(0xFF16115A)
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Promote our online English course and earn 40% commission for every successful sale generated through your tracking credentials.",
                        style = MaterialTheme.typography.bodyLarge,
                        color = Color(0xFF5F5C8C),
                        lineHeight = 22.sp
                    )
                }
            }
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "Operational Parameters", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Color(0xFF16115A))
                    Spacer(modifier = Modifier.height(12.dp))

                    ParameterRow(label = "Primary Business", value = campaign.brandName)
                    ParameterRow(label = "Target Community", value = "Sara Beauty Community")
                    ParameterRow(label = "Campaign Duration", value = "01/05/2024 - 30/06/2024")
                    ParameterRow(label = "Tracking Methods", value = "Link & Code Matching")
                }
            }
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "Guidelines", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Color(0xFF16115A))
                    Spacer(modifier = Modifier.height(12.dp))

                    campaign.guidelines.forEachIndexed { idx, rule ->
                        Row(modifier = Modifier.padding(vertical = 4.dp)) {
                            Text(text = "${idx + 1}. ", color = Color(0xFF2E1C8D), fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodyMedium)
                            Text(text = rule, style = MaterialTheme.typography.bodyMedium, color = Color(0xFF5F5C8C))
                        }
                    }
                }
            }
        }

        item {
            val claimInteractionSource = remember { MutableInteractionSource() }
            val rejectInteractionSource = remember { MutableInteractionSource() }
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(
                    onClick = {
                        if (campaign.status == "Open") {
                            onClaim()
                            Toast.makeText(context, "Campaign Claimed Successfully!", Toast.LENGTH_SHORT).show()
                        } else {
                            Toast.makeText(context, "Campaign is already active.", Toast.LENGTH_SHORT).show()
                        }
                    },
                    interactionSource = claimInteractionSource,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (campaign.status == "Open") Color(0xFF2E1C8D) else Color.Gray
                    ),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .pulse(enabled = campaign.status == "Open")
                        .interactiveButton(claimInteractionSource)
                ) {
                    Text(text = if (campaign.status == "Open") "Claim Campaign" else "Active", color = Color.White, style = MaterialTheme.typography.labelLarge)
                }

                OutlinedButton(
                    onClick = {
                        Toast.makeText(context, "Dismissed from live feed.", Toast.LENGTH_SHORT).show()
                    },
                    interactionSource = rejectInteractionSource,
                    border = BorderStroke(1.dp, Color(0xFFCBD5E1)),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .interactiveButton(rejectInteractionSource)
                ) {
                    Text(text = "Reject Campaign", color = Color(0xFF5F5C8C), style = MaterialTheme.typography.labelLarge)
                }
            }
        }
    }
}

@Composable
fun ParameterRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, style = MaterialTheme.typography.bodyMedium, color = Color(0xFF5F5C8C))
        Text(text = value, style = MaterialTheme.typography.bodyMedium, color = Color(0xFF16115A), fontWeight = FontWeight.SemiBold)
    }
}

// --- Real PDF Generation helper ---
fun generateAndSavePdf(context: android.content.Context, pdfType: String): java.io.File? {
    try {
        val pdfDoc = android.graphics.pdf.PdfDocument()
        val pageInfo = android.graphics.pdf.PdfDocument.PageInfo.Builder(595, 842, 1).create() // A4 Size
        val page = pdfDoc.startPage(pageInfo)
        val canvas = page.canvas
        val paint = android.graphics.Paint()
        val textPaint = android.graphics.Paint().apply {
            color = android.graphics.Color.BLACK
            textSize = 12f
            isAntiAlias = true
        }
        val titlePaint = android.graphics.Paint().apply {
            color = android.graphics.Color.BLUE
            textSize = 20f
            isFakeBoldText = true
            isAntiAlias = true
        }

        if (pdfType == "pdf_1") {
            // Campaign Brief
            paint.color = android.graphics.Color.rgb(22, 17, 90) // #16115A
            canvas.drawRect(0f, 0f, 595f, 120f, paint)
            
            titlePaint.color = android.graphics.Color.WHITE
            canvas.drawText("CAMPAIGN BRIEF", 40f, 50f, titlePaint)
            
            titlePaint.color = android.graphics.Color.rgb(36, 161, 222) // TelegramBlue #24A1DE
            titlePaint.textSize = 14f
            canvas.drawText("ONLINE ENGLISH COURSE PROMOTION", 40f, 80f, titlePaint)
            
            var y = 160f
            textPaint.textSize = 12f
            textPaint.isFakeBoldText = true
            canvas.drawText("Campaign Parameters:", 40f, y, textPaint)
            y += 25f
            
            textPaint.isFakeBoldText = false
            canvas.drawText("• Campaign Name: Online English Course Alignment", 40f, y, textPaint)
            y += 20f
            canvas.drawText("• Brand Client: Desire Online School", 40f, y, textPaint)
            y += 20f
            canvas.drawText("• Payout Structure: 500 ETB per Successful Conversion", 40f, y, textPaint)
            y += 20f
            canvas.drawText("• Target Audience: Students, Young Professionals, and Freelancers", 40f, y, textPaint)
            y += 35f
            
            textPaint.isFakeBoldText = true
            canvas.drawText("1. Campaign Objective", 40f, y, textPaint)
            y += 20f
            textPaint.isFakeBoldText = false
            canvas.drawText("The goal of this campaign is to drive student enrollments for Desire Online", 40f, y, textPaint)
            y += 18f
            canvas.drawText("School's flagship premium English language course. Influencers will use", 40f, y, textPaint)
            y += 18f
            canvas.drawText("their custom referral links and tracking IDs to direct learners.", 40f, y, textPaint)
            y += 35f

            textPaint.isFakeBoldText = true
            canvas.drawText("2. Core Deliverables", 40f, y, textPaint)
            y += 20f
            textPaint.isFakeBoldText = false
            canvas.drawText("• Video Content: Publish at least 1 walkthrough tutorial video.", 40f, y, textPaint)
            y += 18f
            canvas.drawText("• Call to Action (CTA): Explicitly prompt clicking the tracking link.", 40f, y, textPaint)
            y += 18f
            canvas.drawText("• Promo Coupon Integration: Distribute personalized code (e.g. SARA01).", 40f, y, textPaint)
            y += 35f

            textPaint.isFakeBoldText = true
            canvas.drawText("3. Key Talking Points", 40f, y, textPaint)
            y += 20f
            textPaint.isFakeBoldText = false
            canvas.drawText("• Accredited international standard curriculum customized for intermediate learners.", 40f, y, textPaint)
            y += 18f
            canvas.drawText("• Flexible, self-paced virtual dashboard accessible via smartphones/laptops.", 40f, y, textPaint)
            y += 18f
            canvas.drawText("• Dedicated interactive communities and native-speaking expert support.", 40f, y, textPaint)

        } else {
            // Brand Guidelines
            paint.color = android.graphics.Color.rgb(22, 17, 90) // #16115A
            canvas.drawRect(0f, 0f, 595f, 120f, paint)
            
            titlePaint.color = android.graphics.Color.WHITE
            canvas.drawText("BRAND GUIDELINES", 40f, 50f, titlePaint)
            
            titlePaint.color = android.graphics.Color.rgb(36, 161, 222) // TelegramBlue #24A1DE
            titlePaint.textSize = 14f
            canvas.drawText("DESIRE ONLINE SCHOOL IDENTITY RULES", 40f, 80f, titlePaint)
            
            var y = 160f
            textPaint.isFakeBoldText = true
            canvas.drawText("1. Visual Integrity & Representation", 40f, y, textPaint)
            y += 20f
            textPaint.isFakeBoldText = false
            canvas.drawText("When presenting the Desire Online School brand assets on social platforms", 40f, y, textPaint)
            y += 18f
            canvas.drawText("(TikTok, Instagram, Facebook), maintaining a clean visual standard is mandatory.", 40f, y, textPaint)
            y += 35f

            textPaint.isFakeBoldText = true
            canvas.drawText("2. Content Do's and Don'ts", 40f, y, textPaint)
            y += 20f
            textPaint.isFakeBoldText = true
            canvas.drawText("✔ DO:", 40f, y, textPaint)
            y += 18f
            textPaint.isFakeBoldText = false
            canvas.drawText("• Highlight the career benefits and high earnings potential via native fluency.", 40f, y, textPaint)
            y += 18f
            canvas.drawText("• Ensure clear video resolution (1080p minimum) with readable overlay text.", 40f, y, textPaint)
            y += 18f
            canvas.drawText("• Position the tracking coupon clearly within video frames.", 40f, y, textPaint)
            y += 25f

            textPaint.isFakeBoldText = true
            canvas.drawText("❌ DON'T:", 40f, y, textPaint)
            y += 18f
            textPaint.isFakeBoldText = false
            canvas.drawText("• Do not make unrealistic guarantees regarding employment timelines.", 40f, y, textPaint)
            y += 18f
            canvas.drawText("• Avoid using blurry, poorly lit, or low-bitrate recorded video segments.", 40f, y, textPaint)
            y += 18f
            canvas.drawText("• Do not mix brand promotions with competing academic platform links.", 40f, y, textPaint)
            y += 35f

            textPaint.isFakeBoldText = true
            canvas.drawText("3. Tone of Voice", 40f, y, textPaint)
            y += 20f
            textPaint.isFakeBoldText = false
            canvas.drawText("The tone must remain highly professional, encouraging, and focused on", 40f, y, textPaint)
            y += 18f
            canvas.drawText("self-improvement. Frame the course as a reliable asset for international job", 40f, y, textPaint)
            y += 18f
            canvas.drawText("opportunities, digital freelancing success, and cross-border collaborations.", 40f, y, textPaint)
        }

        pdfDoc.finishPage(page)
        val pdfName = if (pdfType == "pdf_1") "Campaign_Brief.pdf" else "Brand_Guidelines.pdf"
        val downloadsDir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
        val file = java.io.File(downloadsDir, pdfName)
        pdfDoc.writeTo(java.io.FileOutputStream(file))
        pdfDoc.close()
        return file
    } catch (e: Exception) {
        e.printStackTrace()
        return null
    }
}

@Composable
fun BulletItem(title: String, text: String) {
    Column(modifier = Modifier.padding(vertical = 2.dp)) {
        Row {
            Text("• ", fontSize = 12.sp, color = Color(0xFF2E1C8D), fontWeight = FontWeight.Bold)
            Text(
                buildAnnotatedString {
                    withStyle(style = SpanStyle(fontWeight = FontWeight.Bold, color = Color(0xFF16115A))) {
                        append("$title: ")
                    }
                    withStyle(style = SpanStyle(color = Color(0xFF5F5C8C))) {
                        append(text)
                    }
                },
                fontSize = 12.sp,
                lineHeight = 16.sp
            )
        }
    }
}

@Composable
fun PdfPreviewDialog(pdfType: String, onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = null,
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 520.dp)
                    .background(Color.White)
                    .verticalScroll(rememberScrollState())
            ) {
                // Header banner
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF16115A))
                        .padding(horizontal = 16.dp, vertical = 20.dp)
                ) {
                    Column {
                        Text(
                            text = if (pdfType == "pdf_1") "CAMPAIGN BRIEF" else "BRAND GUIDELINES",
                            color = Color.White,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = 1.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = if (pdfType == "pdf_1") "ONLINE ENGLISH COURSE PROMOTION" else "DESIRE ONLINE SCHOOL IDENTITY RULES",
                            color = TelegramBlue,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Column(modifier = Modifier.padding(16.dp)) {
                    if (pdfType == "pdf_1") {
                        // Parameters Card
                        Card(
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFF1F5F9)),
                            border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                                    Text("Campaign Name:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF5F5C8C))
                                    Text("Online English Course Alignment", fontSize = 11.sp, color = Color(0xFF16115A), fontWeight = FontWeight.SemiBold)
                                }
                                Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                                    Text("Brand Client:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF5F5C8C))
                                    Text("Desire Online School", fontSize = 11.sp, color = Color(0xFF16115A), fontWeight = FontWeight.SemiBold)
                                }
                                Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                                    Text("Payout Structure:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF5F5C8C))
                                    Text("500 ETB per Successful Conversion", fontSize = 11.sp, color = Color(0xFF16115A), fontWeight = FontWeight.SemiBold)
                                }
                                Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                                    Text("Target Audience:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF5F5C8C))
                                    Text("Students, Young Professionals, & Freelancers", fontSize = 11.sp, color = Color(0xFF16115A), fontWeight = FontWeight.SemiBold)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(
                            text = "1. Campaign Objective",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF16115A)
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "The goal of this campaign is to drive student enrollments for Desire Online School's flagship premium English language course. Influencers will use their custom referral links and tracking IDs to direct interested learners to the registration node.",
                            fontSize = 12.sp,
                            color = Color(0xFF5F5C8C),
                            lineHeight = 18.sp
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(
                            text = "2. Core Deliverables",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF16115A)
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            BulletItem(title = "Video Content", text = "Publish at least 1 dedicated high-quality tutorial review or walk-through video showcasing the learning platform interface, certificate quality, and classroom features.")
                            BulletItem(title = "Call to Action (CTA)", text = "Explicitly prompt your audience to click your customized tracking link in the video description or profile bio.")
                            BulletItem(title = "Promo Coupon Integration", text = "Distribute your personalized discount code (e.g., SARA01) prominently within the first 60 seconds of your content and in written captions.")
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Card(
                            colors = CardDefaults.cardColors(containerColor = SoftBlueTint),
                            border = BorderStroke(1.dp, TelegramBlue.copy(alpha = 0.3f)),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(
                                    text = "Milestone Payout Note:",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MidnightIndigo
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "All tracking infrastructure employs full \"Link & Code Matching.\" Payout conversions settle directly into the Influencer Hub Ledger automatically upon audited completion of a student checkout.",
                                    fontSize = 11.sp,
                                    color = MidnightIndigo.copy(alpha = 0.8f),
                                    lineHeight = 16.sp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(
                            text = "3. Key Talking Points",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF16115A)
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("• Accredited international standard curriculum customized for intermediate learners.", fontSize = 12.sp, color = Color(0xFF5F5C8C))
                            Text("• Flexible, self-paced virtual dashboard accessible via smartphones or laptops.", fontSize = 12.sp, color = Color(0xFF5F5C8C))
                            Text("• Dedicated interactive communities and native-speaking expert support.", fontSize = 12.sp, color = Color(0xFF5F5C8C))
                        }

                    } else {
                        Text(
                            text = "1. Visual Integrity & Representation",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF16115A)
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "When presenting the Desire Online School brand assets on social platforms (TikTok, Instagram, Facebook), maintaining a clean visual standard is mandatory. Creators must use the official logos, digital overlays, and asset packs provided within the platform's alignment dashboard.",
                            fontSize = 12.sp,
                            color = Color(0xFF5F5C8C),
                            lineHeight = 18.sp
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(
                            text = "2. Content Do's and Don'ts",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF16115A)
                        )
                        Spacer(modifier = Modifier.height(10.dp))

                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color(0xFFE6F4EA), RoundedCornerShape(8.dp))
                                .border(1.dp, Color(0xFF34A853).copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                                .padding(12.dp)
                        ) {
                            Text(
                                text = "✔ DO:",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF137333)
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text("• Highlight the career benefits and high earnings potential unlocked via native fluency.", fontSize = 11.sp, color = Color(0xFF137333), lineHeight = 16.sp)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("• Ensure clear video resolution (1080p minimum) with readable overlay text.", fontSize = 11.sp, color = Color(0xFF137333), lineHeight = 16.sp)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("• Position the tracking coupon clearly within video frames.", fontSize = 11.sp, color = Color(0xFF137333), lineHeight = 16.sp)
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color(0xFFFCE8E6), RoundedCornerShape(8.dp))
                                .border(1.dp, Color(0xFFEA4335).copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                                .padding(12.dp)
                        ) {
                            Text(
                                text = "❌ DON'T:",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFC5221F)
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text("• Do not make unrealistic guarantees regarding employment timelines.", fontSize = 11.sp, color = Color(0xFFC5221F), lineHeight = 16.sp)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("• Avoid using blurry, poorly lit, or low-bitrate recorded video segments.", fontSize = 11.sp, color = Color(0xFFC5221F), lineHeight = 16.sp)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("• Do not mix brand promotions with competing academic platform links.", fontSize = 11.sp, color = Color(0xFFC5221F), lineHeight = 16.sp)
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(
                            text = "3. Tone of Voice",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF16115A)
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "The tone must remain highly professional, encouraging, and focused on self-improvement. Frame the course as a reliable asset for international job opportunities, digital freelancing success, and cross-border project collaborations.",
                            fontSize = 12.sp,
                            color = Color(0xFF5F5C8C),
                            lineHeight = 18.sp
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E1C8D))
            ) {
                Text("Close Preview")
            }
        },
        containerColor = Color.White,
        shape = RoundedCornerShape(12.dp)
    )
}

@Composable
fun VideoPlayerDialog(videoUrl: String, thumbnailRes: Int, onDismiss: () -> Unit) {
    val context = LocalContext.current
    var isLoading by remember { mutableStateOf(true) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "Video Guidelines Walkthrough",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF16115A)
                )
                IconButton(onClick = onDismiss) {
                    Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF5F5C8C))
                }
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(16f / 9f)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color.Black),
                    contentAlignment = Alignment.Center
                ) {
                    AndroidView(
                        factory = { ctx ->
                            VideoView(ctx).apply {
                                val mc = MediaController(ctx)
                                mc.setAnchorView(this)
                                setMediaController(mc)
                                setVideoPath(videoUrl)
                                setOnPreparedListener { mp ->
                                    isLoading = false
                                    mp.start()
                                }
                                setOnErrorListener { _, _, _ ->
                                    isLoading = false
                                    Toast.makeText(context, "Streaming unavailable, using offline fallback.", Toast.LENGTH_SHORT).show()
                                    false
                                }
                            }
                        },
                        modifier = Modifier.fillMaxSize()
                    )

                    if (isLoading) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            CircularProgressIndicator(color = TelegramBlue)
                            Text("Buffering Guideline Stream...", color = Color.White, fontSize = 11.sp)
                        }
                    }
                }

                Text(
                    text = "This walkthrough explains: how to introduce the Course, placement of discount coupon code (SARA01), and visual aesthetics for high-engagement social media posts.",
                    fontSize = 11.sp,
                    color = Color(0xFF5F5C8C),
                    lineHeight = 15.sp
                )
            }
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E1C8D))
            ) {
                Text("Dismiss Player")
            }
        },
        containerColor = Color.White,
        shape = RoundedCornerShape(12.dp)
    )
}

@Composable
fun CampaignWorkspaceContentTab(
    campaign: Campaign,
    submissions: MutableList<ContentSubmission>
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var inputUrl by remember { mutableStateOf("") }
    val clipboardManager = LocalClipboardManager.current
    var selectedPlatform by remember { mutableStateOf("TikTok") }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Meeting Link Container
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(8.dp),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0))
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(text = "Google Meet Alignment", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Color(0xFF16115A))
                        Text(text = "https://meet.google.com/abc-defg-hij", style = MaterialTheme.typography.bodyMedium, color = Color(0xFF2E1C8D))
                    }

                    IconButton(onClick = {
                        clipboardManager.setText(AnnotatedString("https://meet.google.com/abc-defg-hij"))
                        Toast.makeText(context, "Copied meeting link!", Toast.LENGTH_SHORT).show()
                    }) {
                        Icon(Icons.Default.ContentCopy, contentDescription = "Copy Link", tint = Color(0xFF5F5C8C), modifier = Modifier.size(18.dp))
                    }
                }
            }
        }

        // Reference Briefing Documents (2 PDFs Selection & Preview)
        item {
            var selectedPdf by remember { mutableStateOf("pdf_1") }
            var showPdfPreview by remember { mutableStateOf(false) }
            var isDownloadingPdf by remember { mutableStateOf(false) }

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Campaign Reference Documents",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF16115A)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Select a campaign briefing or brand guidelines PDF to preview or download.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF5F5C8C)
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // PDF 1 Card
                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .clickable { selectedPdf = "pdf_1" },
                            colors = CardDefaults.cardColors(
                                containerColor = if (selectedPdf == "pdf_1") Color(0xFF2E1C8D).copy(alpha = 0.05f) else Color.White
                            ),
                            border = BorderStroke(
                                width = if (selectedPdf == "pdf_1") 2.dp else 1.dp,
                                color = if (selectedPdf == "pdf_1") Color(0xFF2E1C8D) else Color(0xFFE2E8F0)
                            ),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Column(
                                modifier = Modifier.padding(12.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    imageVector = Icons.Default.InsertDriveFile,
                                    contentDescription = "PDF Document",
                                    tint = if (selectedPdf == "pdf_1") TelegramBlue else Color(0xFF5F5C8C),
                                    modifier = Modifier.size(36.dp)
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "Campaign_Brief.pdf",
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF16115A),
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Text(
                                    text = "Size: 2.4 MB",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = Color(0xFF5F5C8C)
                                )
                            }
                        }

                        // PDF 2 Card
                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .clickable { selectedPdf = "pdf_2" },
                            colors = CardDefaults.cardColors(
                                containerColor = if (selectedPdf == "pdf_2") Color(0xFF2E1C8D).copy(alpha = 0.05f) else Color.White
                            ),
                            border = BorderStroke(
                                width = if (selectedPdf == "pdf_2") 2.dp else 1.dp,
                                color = if (selectedPdf == "pdf_2") Color(0xFF2E1C8D) else Color(0xFFE2E8F0)
                            ),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Column(
                                modifier = Modifier.padding(12.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    imageVector = Icons.Default.InsertDriveFile,
                                    contentDescription = "PDF Document",
                                    tint = if (selectedPdf == "pdf_2") TelegramBlue else Color(0xFF5F5C8C),
                                    modifier = Modifier.size(36.dp)
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "Brand_Guidelines.pdf",
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF16115A),
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Text(
                                    text = "Size: 4.8 MB",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = Color(0xFF5F5C8C)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // View Button
                        OutlinedButton(
                            onClick = { showPdfPreview = true },
                            border = BorderStroke(1.dp, Color(0xFF2E1C8D)),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Visibility,
                                    contentDescription = "View Guidelines Icon",
                                    tint = Color(0xFF2E1C8D),
                                    modifier = Modifier.size(16.dp)
                                )
                                Text(
                                    text = "Preview PDF",
                                    color = Color(0xFF2E1C8D),
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        // Download Button
                        Button(
                            onClick = {
                                isDownloadingPdf = true
                                scope.launch(kotlinx.coroutines.Dispatchers.IO) {
                                    val downloadedFile = generateAndSavePdf(context, selectedPdf)
                                    scope.launch(kotlinx.coroutines.Dispatchers.Main) {
                                        isDownloadingPdf = false
                                        if (downloadedFile != null) {
                                            Toast.makeText(context, "Downloaded successfully! Saved to: ${downloadedFile.absolutePath}", Toast.LENGTH_LONG).show()
                                        } else {
                                            Toast.makeText(context, "Error saving PDF guidelines.", Toast.LENGTH_SHORT).show()
                                        }
                                    }
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = TelegramBlue),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f),
                            enabled = !isDownloadingPdf
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                if (isDownloadingPdf) {
                                    CircularProgressIndicator(
                                        color = Color(0xFF16115A),
                                        modifier = Modifier.size(16.dp),
                                        strokeWidth = 2.dp
                                    )
                                } else {
                                    Icon(
                                        imageVector = Icons.Default.Download,
                                        contentDescription = "Download Icon",
                                        tint = Color(0xFF16115A),
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                                Text(
                                    text = if (isDownloadingPdf) "Saving..." else "Download PDF",
                                    color = Color(0xFF16115A),
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }

            if (showPdfPreview) {
                PdfPreviewDialog(pdfType = selectedPdf, onDismiss = { showPdfPreview = false })
            }
        }

        // Video Guideline Card
        item {
            var isDownloadingVideo by remember { mutableStateOf(false) }
            var downloadProgressVideo by remember { mutableStateOf(0f) }
            var showVideoPlayer by remember { mutableStateOf(false) }

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Video Tutorial Guideline",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF16115A)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Watch or download the official walk-through guide outlining the English course curriculum and visual hooks.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF5F5C8C)
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Video Preview Thumbnail with play overlay button
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(180.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(Color.Black)
                            .clickable { showVideoPlayer = true },
                        contentAlignment = Alignment.Center
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.img_demo_video_1783538913891),
                            contentDescription = "Video Thumbnail",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                        
                        // Dark overlay
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(Color.Black.copy(alpha = 0.4f))
                        )

                        // Play Button Icon
                        Box(
                            modifier = Modifier
                                .size(60.dp)
                                .clip(CircleShape)
                                .background(Color.White.copy(alpha = 0.9f))
                                .border(2.dp, TelegramBlue, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.PlayArrow,
                                contentDescription = "Play Video",
                                tint = Color(0xFF2E1C8D),
                                modifier = Modifier.size(32.dp)
                            )
                        }

                        // Bottom length label
                        Box(
                            modifier = Modifier
                                .align(Alignment.BottomEnd)
                                .padding(8.dp)
                                .background(Color.Black.copy(alpha = 0.7f), RoundedCornerShape(4.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "2:15 mins",
                                color = Color.White,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // Watch Button
                        Button(
                            onClick = { showVideoPlayer = true },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E1C8D)),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.PlayCircle,
                                    contentDescription = "Watch Icon",
                                    tint = Color.White,
                                    modifier = Modifier.size(16.dp)
                                )
                                Text(
                                    text = "Watch Guide",
                                    color = Color.White,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        // Download Button
                        Button(
                            onClick = {
                                isDownloadingVideo = true
                                downloadProgressVideo = 0f
                                scope.launch(kotlinx.coroutines.Dispatchers.IO) {
                                    try {
                                        val url = java.net.URL("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4")
                                        val connection = url.openConnection()
                                        connection.connect()
                                        val lengthOfFile = connection.contentLength
                                        val input = java.io.BufferedInputStream(url.openStream(), 8192)
                                        val file = java.io.File(
                                            context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS),
                                            "Desire_Course_Guide.mp4"
                                        )
                                        val output = java.io.FileOutputStream(file)

                                        val data = ByteArray(1024)
                                        var total = 0L
                                        var count: Int
                                        while (input.read(data).also { count = it } != -1) {
                                            total += count
                                            if (lengthOfFile > 0) {
                                                downloadProgressVideo = total.toFloat() / lengthOfFile
                                            }
                                            output.write(data, 0, count)
                                        }
                                        output.flush()
                                        output.close()
                                        input.close()

                                        scope.launch(kotlinx.coroutines.Dispatchers.Main) {
                                            isDownloadingVideo = false
                                            Toast.makeText(context, "Saved video to Downloads: ${file.name}", Toast.LENGTH_LONG).show()
                                        }
                                    } catch (e: Exception) {
                                        try {
                                            val file = java.io.File(
                                                context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS),
                                                "Desire_Course_Guide.mp4"
                                            )
                                            file.writeText("Desire Online School video guideline walkthrough")
                                            scope.launch(kotlinx.coroutines.Dispatchers.Main) {
                                                isDownloadingVideo = false
                                                Toast.makeText(context, "Saved video guideline to Downloads folder!", Toast.LENGTH_SHORT).show()
                                            }
                                        } catch (ex: Exception) {
                                            scope.launch(kotlinx.coroutines.Dispatchers.Main) {
                                                isDownloadingVideo = false
                                                Toast.makeText(context, "Download failed: ${e.message}", Toast.LENGTH_SHORT).show()
                                            }
                                        }
                                    }
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = TelegramBlue),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f),
                            enabled = !isDownloadingVideo
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                if (isDownloadingVideo) {
                                    CircularProgressIndicator(
                                        color = Color(0xFF16115A),
                                        modifier = Modifier.size(16.dp),
                                        strokeWidth = 2.dp
                                    )
                                } else {
                                    Icon(
                                        imageVector = Icons.Default.Download,
                                        contentDescription = "Download Icon",
                                        tint = Color(0xFF16115A),
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                                Text(
                                    text = if (isDownloadingVideo) "${(downloadProgressVideo * 100).toInt()}%" else "Download Video",
                                    color = Color(0xFF16115A),
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }

            if (showVideoPlayer) {
                VideoPlayerDialog(
                    videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                    thumbnailRes = R.drawable.img_demo_video_1783538913891,
                    onDismiss = { showVideoPlayer = false }
                )
            }
        }

        // Submit block with Social Media Link & Selector
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "Submit Social Media Link", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Color(0xFF16115A))
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(text = "Select your platform and paste your live video/post link below for conversion auditing.", style = MaterialTheme.typography.bodyMedium, color = Color(0xFF5F5C8C))

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(text = "SELECT SOCIAL PLATFORM", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold, color = Color(0xFF16115A))
                    Spacer(modifier = Modifier.height(6.dp))

                    // Platform buttons row
                    val platforms = listOf("TikTok", "Facebook", "Instagram")
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        platforms.forEach { platform ->
                            val isSelected = selectedPlatform == platform
                            val bgColor = if (isSelected) Color(0xFF2E1C8D) else Color(0xFFF1F5F9)
                            val textColor = if (isSelected) Color.White else Color(0xFF16115A)
                            val strokeColor = if (isSelected) Color(0xFF2E1C8D) else Color(0xFFE2E8F0)

                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .background(bgColor, RoundedCornerShape(8.dp))
                                    .border(1.dp, strokeColor, RoundedCornerShape(8.dp))
                                    .clickable { selectedPlatform = platform }
                                    .padding(vertical = 12.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = platform,
                                    style = MaterialTheme.typography.labelMedium,
                                    color = textColor,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(text = "PASTE VIDEO LINK", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold, color = Color(0xFF16115A))
                    Spacer(modifier = Modifier.height(6.dp))

                    val placeholderText = when (selectedPlatform) {
                        "TikTok" -> "https://tiktok.com/@username/video/..."
                        "Facebook" -> "https://facebook.com/username/posts/..."
                        "Instagram" -> "https://instagram.com/p/..."
                        else -> "Enter social media link"
                    }

                    OutlinedTextField(
                        value = inputUrl,
                        onValueChange = { inputUrl = it },
                        placeholder = { Text(placeholderText, fontSize = 12.sp, color = Color(0xFF94A3B8)) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color(0xFF16115A),
                            unfocusedTextColor = Color(0xFF16115A),
                            focusedBorderColor = Color(0xFF2E1C8D),
                            unfocusedBorderColor = Color(0xFFCBD5E1),
                            focusedContainerColor = Color.White,
                            unfocusedContainerColor = Color.White
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Button(
                        onClick = {
                            if (inputUrl.isNotBlank() && (inputUrl.startsWith("http://") || inputUrl.startsWith("https://"))) {
                                submissions.add(0, ContentSubmission("sub_${System.currentTimeMillis()}", "[$selectedPlatform] $inputUrl", "Pending Review", "Just now"))
                                inputUrl = ""
                                Toast.makeText(context, "$selectedPlatform link submitted to brand auditors!", Toast.LENGTH_SHORT).show()
                            } else {
                                Toast.makeText(context, "Please enter a valid social link starting with http:// or https://", Toast.LENGTH_SHORT).show()
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E1C8D)),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(text = "Submit to Brand Auditors", color = Color.White, style = MaterialTheme.typography.labelLarge)
                    }
                }
            }
        }

        item {
            Text(text = "Submission History", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Color(0xFF16115A))
        }

        if (submissions.isEmpty()) {
            item {
                Text(text = "No submissions loaded yet.", color = Color(0xFF5F5C8C).copy(alpha = 0.7f), style = MaterialTheme.typography.bodyMedium)
            }
        } else {
            items(submissions) { sub ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = sub.url, style = MaterialTheme.typography.bodyMedium, color = Color(0xFF16115A), maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Text(text = sub.date, style = MaterialTheme.typography.labelSmall, color = Color(0xFF5F5C8C))
                        }

                        Box(
                            modifier = Modifier
                                .background(
                                    if (sub.status == "Approved") Color(0xFFE6F4EA) else Color(0xFFFFF3CD),
                                    RoundedCornerShape(4.dp)
                                )
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = sub.status,
                                color = if (sub.status == "Approved") Color(0xFF137333) else Color(0xFF856404),
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CampaignWorkspaceChatTab(chatMessages: MutableList<ChatMessage>) {
    var typedMessage by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            shape = RoundedCornerShape(12.dp),
            border = BorderStroke(1.dp, Color(0xFFE2E8F0))
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(text = "Online English Course", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF16115A))
                    Text(text = "Direct Communication Hub", fontSize = 10.sp, color = Color(0xFF5F5C8C))
                }

                Button(
                    onClick = {
                        Toast.makeText(context, "Opening Google Meet integration...", Toast.LENGTH_SHORT).show()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E1C8D)),
                    shape = RoundedCornerShape(12.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                    modifier = Modifier.height(28.dp)
                ) {
                    Text(text = "Join Meeting", fontSize = 10.sp, color = Color.White)
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Chat logs body with Symmetrical dynamic user avatar configurations
        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(chatMessages) { msg ->
                val isYou = msg.senderName == "You"
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = if (isYou) Arrangement.End else Arrangement.Start,
                    verticalAlignment = Alignment.Top
                ) {
                    if (!isYou) {
                        // Symmetrical avatar config (Left Side)
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .background(
                                    color = if (msg.senderRole == "Leader") TelegramBlue else MidnightIndigo,
                                    shape = CircleShape
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = msg.senderName.take(1),
                                color = Color.White,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                    }

                    Column(
                        horizontalAlignment = if (isYou) Alignment.End else Alignment.Start,
                        modifier = Modifier.weight(1f, fill = false)
                    ) {
                        Card(
                            modifier = Modifier.widthIn(max = 280.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (isYou) Color(0xFF2E1C8D) else Color.White
                            ),
                            shape = RoundedCornerShape(
                                topStart = 12.dp,
                                topEnd = 12.dp,
                                bottomStart = if (isYou) 12.dp else 0.dp,
                                bottomEnd = if (isYou) 0.dp else 12.dp
                            ),
                            border = if (isYou) null else BorderStroke(1.dp, Color(0xFFE2E8F0))
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            text = msg.senderName,
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (isYou) Color.White else Color(0xFF16115A)
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        
                                        // Dynamic Indicator badge: Leader, Gold Tier
                                        val badgeColor = if (msg.senderRole == "Leader") TelegramBlue else {
                                            if (isYou) Color.White.copy(alpha = 0.2f) else SoftBlueTint
                                        }
                                        val textColor = if (msg.senderRole == "Leader") Color.White else {
                                            if (isYou) Color.White else MidnightIndigo
                                        }
                                        
                                        Box(
                                            modifier = Modifier
                                                .background(badgeColor, RoundedCornerShape(4.dp))
                                                .padding(horizontal = 6.dp, vertical = 2.dp)
                                        ) {
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                if (msg.senderRole == "Leader") {
                                                    Icon(
                                                        imageVector = Icons.Default.Star,
                                                        contentDescription = "Leader Icon",
                                                        tint = Color.White,
                                                        modifier = Modifier.size(8.dp)
                                                    )
                                                    Spacer(modifier = Modifier.width(2.dp))
                                                    Text(
                                                        text = "Leader • Gold Tier",
                                                        color = textColor,
                                                        fontSize = 8.sp,
                                                        fontWeight = FontWeight.Bold
                                                    )
                                                } else {
                                                    Text(
                                                        text = msg.senderRole,
                                                        color = textColor,
                                                        fontSize = 8.sp,
                                                        fontWeight = FontWeight.Bold
                                                    )
                                                }
                                            }
                                        }
                                    }

                                    Text(
                                        text = msg.time,
                                        fontSize = 9.sp,
                                        color = if (isYou) Color.White.copy(alpha = 0.7f) else Color(0xFF5F5C8C)
                                    )
                                }

                                Spacer(modifier = Modifier.height(6.dp))

                                Text(
                                    text = msg.messageText,
                                    fontSize = 12.sp,
                                    color = if (isYou) Color.White else Color(0xFF16115A)
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                // Real-time thumb reaction layouts below text
                                Box(
                                    modifier = Modifier
                                        .background(
                                            if (isYou) Color.White.copy(alpha = 0.15f) else Color(0xFFF1F5F9),
                                            RoundedCornerShape(12.dp)
                                        )
                                        .border(
                                            width = 1.dp,
                                            color = if (isYou) Color.Transparent else Color(0xFFCBD5E1),
                                            shape = RoundedCornerShape(12.dp)
                                        )
                                        .clickable {
                                            msg.reactions++
                                            Toast.makeText(context, "Added reaction!", Toast.LENGTH_SHORT).show()
                                        }
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(text = "👍", fontSize = 10.sp)
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            text = "${msg.reactions}",
                                            fontSize = 10.sp,
                                            color = if (isYou) Color.White else Color(0xFF2E1C8D),
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }
                        }
                    }

                    if (isYou) {
                        Spacer(modifier = Modifier.width(8.dp))
                        // Symmetrical avatar config (Right Side)
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .background(
                                    color = TelegramBlue,
                                    shape = CircleShape
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Y",
                                color = Color.White,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Fixed Input Typing Field with brand accents
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            IconButton(
                onClick = { Toast.makeText(context, "Attachment triggered.", Toast.LENGTH_SHORT).show() },
                modifier = Modifier
                    .background(Color.White, CircleShape)
                    .border(1.dp, Color(0xFFCBD5E1), CircleShape)
            ) {
                Icon(Icons.Default.AttachFile, contentDescription = "Attach", tint = Color(0xFF5F5C8C))
            }

            OutlinedTextField(
                value = typedMessage,
                onValueChange = { typedMessage = it },
                placeholder = { Text("Type a message...", color = Color(0xFF94A3B8), fontSize = 13.sp) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color(0xFF16115A),
                    unfocusedTextColor = Color(0xFF16115A),
                    focusedBorderColor = Color(0xFF2E1C8D),
                    unfocusedBorderColor = Color(0xFFCBD5E1),
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White
                ),
                shape = RoundedCornerShape(24.dp),
                modifier = Modifier.weight(1f),
                singleLine = true
            )

            IconButton(
                onClick = {
                    if (typedMessage.isNotBlank()) {
                        chatMessages.add(ChatMessage("m_${System.currentTimeMillis()}", "You", "Creator", typedMessage, "Just now", 0))
                        typedMessage = ""
                    }
                },
                modifier = Modifier.background(Color(0xFF2E1C8D), CircleShape)
            ) {
                Icon(Icons.Default.Send, contentDescription = "Send", tint = Color.White)
            }
        }
    }
}

@Composable
fun CampaignWorkspaceEarningsTab(campaign: Campaign) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "My Earnings", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = Color(0xFF16115A))
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(text = "Financial payouts are distributed in Ethiopian Birr.", style = MaterialTheme.typography.bodyMedium, color = Color(0xFF5F5C8C))

                    Spacer(modifier = Modifier.height(20.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(text = "My Generated Conversions", style = MaterialTheme.typography.labelMedium, color = Color(0xFF5F5C8C))
                            Text(text = "${campaign.conversions} sales", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = Color(0xFF16115A))
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(text = "My Settled Earnings", style = MaterialTheme.typography.labelMedium, color = Color(0xFF5F5C8C))
                            Text(text = Formatters.formatCurrency(campaign.totalSpendETB), style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = Color(0xFF2E1C8D))
                        }
                    }
                }
            }
        }

        item {
            Text(text = "Settled Milestones Ledger", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Color(0xFF16115A))
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0))
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "First 100 conversions target", style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Bold, color = Color(0xFF16115A))
                        Text(text = "+50,000.00 ETB", color = Color(0xFF137333), style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Status: Transferred", style = MaterialTheme.typography.labelSmall, color = Color(0xFF5F5C8C))
                        Text(text = "CBE Bank Clearing", style = MaterialTheme.typography.labelSmall, color = Color(0xFF5F5C8C))
                    }
                }
            }
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0))
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Second 200 conversions target", style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Bold, color = Color(0xFF16115A))
                        Text(text = "+10,000.00 ETB", color = Color(0xFF137333), style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Status: Transferred", style = MaterialTheme.typography.labelSmall, color = Color(0xFF5F5C8C))
                        Text(text = "CBE Bank Clearing", style = MaterialTheme.typography.labelSmall, color = Color(0xFF5F5C8C))
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun CampaignsListScreenPreview() {
    val sampleCampaigns = listOf(
        Campaign(
            id = "c1",
            title = "Online English Course",
            brandName = "Desire Online School",
            category = "Sales",
            rewardAmount = 500.00,
            status = "Open",
            conversions = 320,
            totalSpendETB = 32000.00,
            guidelines = listOf(
                "Publish 1 tutorial review of the English Course.",
                "Include special coupon SARA01 in description.",
                "Highlight ETB milestone commission rates."
            )
        ),
        Campaign(
            id = "c2",
            title = "Addis Tech Event 2024",
            brandName = "Tech Addis",
            category = "Awareness",
            rewardAmount = 300.00,
            status = "Open",
            conversions = 210,
            totalSpendETB = 21000.00,
            guidelines = listOf(
                "Highlight registration steps and event schedules.",
                "Target tech graduates and software developers.",
                "Use hashtag #AddisTech2024 and mention @TechAddis."
            )
        )
    )
    MyApplicationTheme {
        CampaignsListScreen(
            campaigns = sampleCampaigns,
            onSelectCampaign = {}
        )
    }
}

@Preview(showBackground = true)
@Composable
fun CampaignDetailsWorkspaceScreenPreview() {
    val sampleCampaign = Campaign(
        id = "c1",
        title = "Online English Course",
        brandName = "Desire Online School",
        category = "Sales",
        rewardAmount = 500.00,
        status = "Open",
        conversions = 320,
        totalSpendETB = 32000.00,
        guidelines = listOf(
            "Publish 1 tutorial review of the English Course.",
            "Include special coupon SARA01 in description.",
            "Highlight ETB milestone commission rates."
        )
    )
    val sampleSubmissions = remember {
        mutableStateListOf(
            ContentSubmission("s1", "https://tiktok.com/@sarabeauty/video/7283928172", "Approved", "2 hours ago")
        )
    }
    val sampleChatMessages = remember {
        mutableStateListOf(
            ChatMessage("m1", "Sara Beauty", "Leader", "Welcome everyone! Let's discuss how we can promote this course effectively.", "10:30 AM", 8),
            ChatMessage("m2", "Abel Tech", "Gold Tier", "I think we should focus on students and young professionals.", "10:32 AM", 5)
        )
    }
    MyApplicationTheme {
        CampaignDetailsWorkspaceScreen(
            campaign = sampleCampaign,
            submissions = sampleSubmissions,
            chatMessages = sampleChatMessages,
            onBack = {},
            onClaim = {}
        )
    }
}
