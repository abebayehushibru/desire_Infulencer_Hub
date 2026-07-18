package com.example

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun HomeDashboardScreen(
    campaigns: List<Campaign>,
    onSelectCampaign: (String) -> Unit
) {
    val context = LocalContext.current
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Transparent) // Transparent background to let parent gradient show through
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Welcome User Card (Matches Vite Portal stats layout)
        item {
            ScrollEntranceTransition(index = 0) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .liftOnInteraction(),
                    colors = CardDefaults.cardColors(containerColor = Color(0x0FFFFFFF)),
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(0.5.dp, Color.White.copy(alpha = 0.15f)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        val greeting = androidx.compose.runtime.remember {
                            val hour = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY)
                            if (hour in 0..11) "Good morning." else "Good afternoon."
                        }
                        Text(
                            text = greeting,
                            fontSize = 18.sp, // Scale down to 18.sp max
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White // White directly on dark/shimmer background
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Here's what's happening with your Ethiopian campaigns today.",
                            fontSize = 12.sp, // Scale down to 12.sp
                            fontWeight = FontWeight.Normal,
                            color = Color.White.copy(alpha = 0.85f)
                        )
                    }
                }
            }
        }

        // 4 Grid Stats: Duplicated exactly from our Visual Blueprint Web Overview
        item {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                ScrollEntranceTransition(index = 1) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        DashboardStatCard(
                            title = "Active Campaigns",
                            value = "8",
                            sub = "+2 this week",
                            subPositive = true,
                            modifier = Modifier.weight(1f)
                        )
                        DashboardStatCard(
                            title = "Total Conversions",
                            value = "1,250",
                            sub = "+18% this week",
                            subPositive = true,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
                ScrollEntranceTransition(index = 2) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        DashboardStatCard(
                            title = "Total Spend",
                            value = "125K ETB",
                            sub = "-8% this week",
                            subPositive = false,
                            modifier = Modifier.weight(1f)
                        )
                        DashboardStatCard(
                            title = "Total Earnings",
                            value = "500K ETB",
                            sub = "+22% this week",
                            subPositive = true,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }

        // Section title: "Recent Campaigns"
        item {
            ScrollEntranceTransition(index = 3) {
                Text(
                    text = "Recent Campaigns",
                    fontSize = 18.sp, // Scale down to 18.sp max
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF110D59), // High contrast dark navy on light background
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 16.dp, bottom = 8.dp)
                )
            }
        }

        // List of recent campaigns mirroring the table
        items(campaigns.size) { index ->
            val campaign = campaigns[index]
            val cardInteractionSource = remember { MutableInteractionSource() }
            ScrollEntranceTransition(index = 4 + index) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .liftOnInteraction(cardInteractionSource)
                        .tactileScale(cardInteractionSource)
                        .clickable(
                            interactionSource = cardInteractionSource,
                            indication = androidx.compose.foundation.LocalIndication.current
                        ) { onSelectCampaign(campaign.id) },
                    colors = CardDefaults.cardColors(containerColor = Color(0x0FFFFFFF)),
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(0.5.dp, Color(0xFF110D59).copy(alpha = 0.15f)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = campaign.title,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF110D59), // Deep high-contrast dark navy
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .background(Color(0xFF110D59).copy(alpha = 0.08f), RoundedCornerShape(4.dp))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = campaign.category,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF110D59) // Clear dark category label
                                    )
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "By ${campaign.brandName}",
                                    fontSize = 11.sp,
                                    color = Color(0xFF475569) // Contrasting slate gray
                                )
                            }
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = Formatters.formatCurrency(campaign.rewardAmount),
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF110D59) // High contrast reward amount
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = campaign.status,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = when (campaign.status) {
                                    "Open" -> Color(0xFF15803D) // Darker high-contrast forest green
                                    "Claimed" -> Color(0xFFB45309) // High-contrast amber
                                    "Completed" -> Color(0xFF475569) // Dark slate gray
                                    else -> Color(0xFFB91C1C) // Deep dark red
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun DashboardStatCard(
    title: String,
    value: String,
    sub: String,
    subPositive: Boolean,
    modifier: Modifier = Modifier
) {
    val interactionSource = remember { MutableInteractionSource() }
    Card(
        modifier = modifier
            .liftOnInteraction(interactionSource)
            .clickable(
                interactionSource = interactionSource,
                indication = androidx.compose.foundation.LocalIndication.current
            ) { /* Stat detail click */ },
        colors = CardDefaults.cardColors(containerColor = Color(0x0FFFFFFF)),
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(0.5.dp, Color.White.copy(alpha = 0.15f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(
                text = title,
                fontSize = 11.sp, // Sub-label: Scale down to 11.sp
                color = Color.White.copy(alpha = 0.7f),
                fontWeight = FontWeight.Medium
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = value,
                fontSize = 15.sp, // Card content value: 15.sp max
                fontWeight = FontWeight.ExtraBold,
                color = Color.White
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = sub,
                fontSize = 11.sp, // Sub-label: Scale down to 11.sp
                fontWeight = FontWeight.Bold,
                color = if (subPositive) Color(0xFF4ADE80) else Color(0xFFF87171)
            )
        }
    }
}

