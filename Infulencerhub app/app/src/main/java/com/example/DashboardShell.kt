package com.example

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.interaction.MutableInteractionSource

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardShell(
    loggedInPhone: String,
    onLogout: () -> Unit
) {
    var activeTab by remember { mutableStateOf(MainTab.HOME) }
    var selectedCampaignId by remember { mutableStateOf<String?>(null) }
    var isChatActive by remember { mutableStateOf(false) }

    // Campaign State Database Source
    val campaignsList = remember {
        mutableStateListOf(
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
            ),
            Campaign(
                id = "c3",
                title = "TikTok Followers Boost",
                brandName = "Trendy Shop",
                category = "Growth",
                rewardAmount = 200.00,
                status = "Draft",
                conversions = 0,
                totalSpendETB = 0.0,
                guidelines = listOf(
                    "Promote modern custom shoes line on TikTok.",
                    "Encourage follower growth using sound tracks."
                )
            ),
            Campaign(
                id = "c4",
                title = "New Shoes Collection",
                brandName = "Shoe Store",
                category = "Sales",
                rewardAmount = 450.00,
                status = "Completed",
                conversions = 420,
                totalSpendETB = 42000.0,
                guidelines = listOf(
                    "Aesthetic styling reels wearing new sneaker drops.",
                    "Provide store location details near Bole Medhanialem."
                )
            )
        )
    }

    // Media submissions database
    val submissionFeed = remember {
        mutableStateListOf(
            ContentSubmission("s1", "https://tiktok.com/@sarabeauty/video/7283928172", "Approved", "2 hours ago")
        )
    }

    // Workspace Live Chat messages
    val chatMessagesFeed = remember {
        mutableStateListOf(
            ChatMessage("m1", "Sara Beauty", "Leader", "Welcome everyone! Let's discuss how we can promote this course effectively.", "10:30 AM", 8),
            ChatMessage("m2", "Abel Tech", "Gold Tier", "I think we should focus on students and young professionals.", "10:32 AM", 5),
            ChatMessage("m3", "Lily", "Gold Tier", "Agreed! Short videos on TikTok will work best.", "10:35 AM", 4)
        )
    }

    // Dynamic Navigation Routing Handlers
    Scaffold(
        topBar = {
            if (activeTab == MainTab.HOME && selectedCampaignId == null) {
                TopAppBar(
                    title = {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            InfluenceHubFullLogo(
                                symbolSize = 34.dp,
                                isDarkBackground = true,
                                showSlogan = false
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color(0xFF110D59),
                        titleContentColor = Color.White
                    )
                )
            }
        },
        bottomBar = {
            if (activeTab != MainTab.CHAT || !isChatActive) {
                NavigationBar(
                    containerColor = Color.White,
                    tonalElevation = 8.dp
                ) {
                    val homeInteraction = remember { MutableInteractionSource() }
                    NavigationBarItem(
                        selected = activeTab == MainTab.HOME && selectedCampaignId == null,
                        onClick = {
                            activeTab = MainTab.HOME
                            selectedCampaignId = null
                            isChatActive = false
                        },
                        modifier = Modifier.tactileScale(homeInteraction),
                        interactionSource = homeInteraction,
                        icon = { Icon(Icons.Default.Dashboard, contentDescription = "Dashboard") },
                        label = { Text("Home", fontSize = 11.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Color(0xFF2E1C8D),
                            selectedTextColor = Color(0xFF2E1C8D),
                            indicatorColor = Color(0xFFFEB209).copy(alpha = 0.2f),
                            unselectedIconColor = Color(0xFF5F5C8C),
                            unselectedTextColor = Color(0xFF5F5C8C)
                        )
                    )

                    val campaignsInteraction = remember { MutableInteractionSource() }
                    NavigationBarItem(
                        selected = activeTab == MainTab.CAMPAIGNS || selectedCampaignId != null,
                        onClick = {
                            activeTab = MainTab.CAMPAIGNS
                            isChatActive = false
                        },
                        modifier = Modifier.tactileScale(campaignsInteraction),
                        interactionSource = campaignsInteraction,
                        icon = { Icon(Icons.Default.Campaign, contentDescription = "Campaigns") },
                        label = { Text("Campaigns", fontSize = 11.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Color(0xFF2E1C8D),
                            selectedTextColor = Color(0xFF2E1C8D),
                            indicatorColor = Color(0xFFFEB209).copy(alpha = 0.2f),
                            unselectedIconColor = Color(0xFF5F5C8C),
                            unselectedTextColor = Color(0xFF5F5C8C)
                        )
                    )

                    val chatInteraction = remember { MutableInteractionSource() }
                    NavigationBarItem(
                        selected = activeTab == MainTab.CHAT,
                        onClick = {
                            activeTab = MainTab.CHAT
                            selectedCampaignId = null
                        },
                        modifier = Modifier.tactileScale(chatInteraction),
                        interactionSource = chatInteraction,
                        icon = { Icon(Icons.Default.Chat, contentDescription = "Chat Hub") },
                        label = { Text("Chat", fontSize = 11.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Color(0xFF2E1C8D),
                            selectedTextColor = Color(0xFF2E1C8D),
                            indicatorColor = Color(0xFFFEB209).copy(alpha = 0.2f),
                            unselectedIconColor = Color(0xFF5F5C8C),
                            unselectedTextColor = Color(0xFF5F5C8C)
                        )
                    )

                    val earningsInteraction = remember { MutableInteractionSource() }
                    NavigationBarItem(
                        selected = activeTab == MainTab.EARNINGS && selectedCampaignId == null,
                        onClick = {
                            activeTab = MainTab.EARNINGS
                            selectedCampaignId = null
                            isChatActive = false
                        },
                        modifier = Modifier.tactileScale(earningsInteraction),
                        interactionSource = earningsInteraction,
                        icon = { Icon(Icons.Default.AccountBalanceWallet, contentDescription = "Earnings Hub") },
                        label = { Text("Earnings", fontSize = 11.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Color(0xFF2E1C8D),
                            selectedTextColor = Color(0xFF2E1C8D),
                            indicatorColor = Color(0xFFFEB209).copy(alpha = 0.2f),
                            unselectedIconColor = Color(0xFF5F5C8C),
                            unselectedTextColor = Color(0xFF5F5C8C)
                        )
                    )

                    val profileInteraction = remember { MutableInteractionSource() }
                    NavigationBarItem(
                        selected = activeTab == MainTab.PROFILE && selectedCampaignId == null,
                        onClick = {
                            activeTab = MainTab.PROFILE
                            selectedCampaignId = null
                            isChatActive = false
                        },
                        modifier = Modifier.tactileScale(profileInteraction),
                        interactionSource = profileInteraction,
                        icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
                        label = { Text("Profile", fontSize = 11.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Color(0xFF2E1C8D),
                            selectedTextColor = Color(0xFF2E1C8D),
                            indicatorColor = Color(0xFFFEB209).copy(alpha = 0.2f),
                            unselectedIconColor = Color(0xFF5F5C8C),
                            unselectedTextColor = Color(0xFF5F5C8C)
                        )
                    )
                }
            }
        },
        containerColor = Color.Transparent
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFF0A1140), // Start (Top): Rich, deep, bold navy blue
                            Color(0xFF110D59), // Middle (Center): Intense brand navy
                            Color(0xFFFFFFFF)  // End (Bottom): Crisp, bright White fade
                        )
                    )
                )
        ) {
            // Check dynamic detail views first
            if (selectedCampaignId != null) {
                val campaign = campaignsList.find { it.id == selectedCampaignId }
                if (campaign != null) {
                    CampaignDetailsWorkspaceScreen(
                        campaign = campaign,
                        submissions = submissionFeed,
                        chatMessages = chatMessagesFeed,
                        onBack = { selectedCampaignId = null },
                        onClaim = {
                            val idx = campaignsList.indexOfFirst { it.id == campaign.id }
                            if (idx != -1) {
                                campaignsList[idx] = campaign.copy(status = "Claimed")
                            }
                        }
                    )
                } else {
                    selectedCampaignId = null
                }
            } else {
                // Default Primary Tabs
                when (activeTab) {
                    MainTab.HOME -> HomeDashboardScreen(
                        campaigns = campaignsList,
                        onSelectCampaign = { id -> selectedCampaignId = id }
                    )
                    MainTab.CAMPAIGNS -> CampaignsListScreen(
                        campaigns = campaignsList,
                        onSelectCampaign = { id -> selectedCampaignId = id }
                    )
                    MainTab.CHAT -> ChatHubScreen(
                        isChatActive = isChatActive,
                        onChatActiveChanged = { isChatActive = it }
                    )
                    MainTab.EARNINGS -> EarningsHubScreen()
                    MainTab.PROFILE -> ProfileScreen(loggedInPhone = loggedInPhone, onLogout = onLogout)
                }
            }
        }
    }
}
