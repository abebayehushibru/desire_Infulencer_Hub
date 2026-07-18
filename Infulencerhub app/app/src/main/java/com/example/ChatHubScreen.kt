package com.example

import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

// ---------------------- DATA MODELS ----------------------
data class ChatThreadItem(
    val id: String,
    val name: String,
    val previewMessage: String,
    val category: String, // "community", "group", "dm"
    val tag: String = "",
    val unreadCount: Int = 0,
    val isPinned: Boolean = false,
    val avatarRes: Int? = null,
    val avatarIcon: ImageVector? = null,
    val avatarText: String? = null
)

// ---------------------- MAIN CHAT SCREEN ----------------------
@Composable
fun ChatHubScreen(
    isChatActive: Boolean = false,
    onChatActiveChanged: (Boolean) -> Unit = {}
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    // Stateful threads list organized by Communities, Groups & Sponsors, Individual Persons (Direct Messages)
    val threads = remember {
        mutableStateListOf(
            // 1. Communities / Hubs
            ChatThreadItem(
                id = "community_hub",
                name = "Vite Community Hub",
                previewMessage = "New message: Link the landing page in bio!",
                category = "community",
                unreadCount = 3,
                isPinned = true,
                avatarIcon = Icons.Default.Forum
            ),
            ChatThreadItem(
                id = "general_hub",
                name = "General Creators Channel",
                previewMessage = "Sara Beauty: Anyone noticed a surge in Addis after 7 PM?",
                category = "community",
                unreadCount = 0,
                isPinned = true,
                avatarIcon = Icons.Default.Groups
            ),
            
            // 2. Groups & Sponsors
            ChatThreadItem(
                id = "heineken_promo",
                name = "Heineken Sponsor Group",
                previewMessage = "Sponsor: New brief coming up for Harar Beer campaign.",
                category = "group",
                unreadCount = 1,
                isPinned = true,
                avatarIcon = Icons.Default.Campaign
            ),
            ChatThreadItem(
                id = "product_launch",
                name = "Product Launch Camp",
                previewMessage = "Leader: New milestone approval! Check guidelines.",
                category = "group",
                unreadCount = 2,
                isPinned = false,
                avatarIcon = Icons.Default.TrendingUp
            ),
            ChatThreadItem(
                id = "campaign_brand_x",
                name = "Campaign: 'Brand X'",
                previewMessage = "Sponsor: Proposal accepted! Proceed with onboarding.",
                category = "group",
                unreadCount = 0,
                isPinned = false,
                avatarIcon = Icons.Default.Star
            ),

            // 3. Individual Persons (Direct Messages)
            ChatThreadItem(
                id = "desire_node",
                name = "Desire Node Support (Verified)",
                previewMessage = "Operator: Please ensure bank details are completed.",
                category = "dm",
                unreadCount = 0,
                isPinned = true,
                avatarRes = R.drawable.img_sara_beauty_1783538902631
            ),
            ChatThreadItem(
                id = "sara_beauty_dm",
                name = "Sara Beauty",
                previewMessage = "Hey, thanks for the review! I really liked the cut.",
                category = "dm",
                unreadCount = 0,
                isPinned = false,
                avatarRes = R.drawable.img_sara_beauty_1783538902631
            ),
            ChatThreadItem(
                id = "abel_tech_dm",
                name = "Abel Tech",
                previewMessage = "I am working on the withdrawal request integration.",
                category = "dm",
                unreadCount = 1,
                isPinned = false,
                avatarIcon = Icons.Default.Person
            ),
            ChatThreadItem(
                id = "ethio_birr_finance",
                name = "Ethio Birr Support (ETB)",
                previewMessage = "Withdrawal of 14,000 ETB has been completed.",
                category = "dm",
                unreadCount = 0,
                isPinned = false,
                avatarText = "ETB"
            )
        )
    }

    var selectedThreadId by remember { mutableStateOf<String?>(null) }
    var searchQuery by remember { mutableStateOf("") }

    // Sync selected thread state with bottom bar visibility callback
    LaunchedEffect(selectedThreadId) {
        onChatActiveChanged(selectedThreadId != null)
    }

    // Stateful messages for each thread
    val threadMessagesMap = remember {
        mutableStateMapOf<String, androidx.compose.runtime.snapshots.SnapshotStateList<ChatMessage>>().apply {
            put("community_hub", mutableStateListOf(
                ChatMessage("c1", "Alice", "Creator", "Hey everyone, don't forget to tag #ViteCreator in all active posts!", "09:05 AM", 5),
                ChatMessage("c2", "Bob", "Creator", "Thanks for the reminder, Alice! Ready for the brand brief.", "09:12 AM", 2),
                ChatMessage("c3", "Alice", "Creator", "New group message from Alice: Also make sure to link the landing page in your bio.", "11:20 AM", 6)
            ))
            put("general_hub", mutableStateListOf(
                ChatMessage("gh1", "Sara Beauty", "Leader", "Hey everyone! Anyone noticed a surge in engagement after 7 PM in Addis?", "09:30 AM", 4),
                ChatMessage("gh2", "Nahom Media", "Leader", "Yes! 7:00 PM to 9:30 PM is the sweet spot.", "09:32 AM", 7),
                ChatMessage("gh3", "Sara Beauty", "Leader", "Sara Beauty: Hey everyone! Let's discuss evening slots.", "10:45 AM", 3)
            ))
            put("heineken_promo", mutableStateListOf(
                ChatMessage("hp1", "Heineken Promo", "Sponsor", "Hi creators! We are excited to launch our local draft activation next week.", "Yesterday", 10),
                ChatMessage("hp2", "Sponsor", "Sponsor", "Sponsor: New brief coming up for Harar Beer campaign. Rewards up to 25,000 ETB.", "Yesterday", 12)
            ))
            put("product_launch", mutableStateListOf(
                ChatMessage("pl1", "Project Lead", "Leader", "Welcome to Product Launch Camp! Let's coordinate the deliverables for this week.", "Yesterday", 3),
                ChatMessage("pl2", "You", "Creator", "I will submit the initial draft of the promo video by tomorrow morning.", "Yesterday", 2),
                ChatMessage("pl3", "Project Lead", "Leader", "Leader: New milestone approval! Check guidelines.", "10:10 AM", 4)
            ))
            put("campaign_brand_x", mutableStateListOf(
                ChatMessage("bx1", "Brand Rep", "Sponsor", "Hi there, your proposal looks fantastic.", "Tuesday", 8),
                ChatMessage("bx2", "Sponsor", "Sponsor", "Sponsor: Proposal accepted! Proceed with onboarding.", "01:15 PM", 12)
            ))
            put("desire_node", mutableStateListOf(
                ChatMessage("dn1", "System Operator", "Operator", "Welcome to Vite Node. Please ensure all your bank details are completed.", "08:00 AM", 0),
                ChatMessage("dn2", "System Operator", "Operator", "Operator: Please ensure all bank details are up to date.", "08:15 AM", 1)
            ))
            put("sara_beauty_dm", mutableStateListOf(
                ChatMessage("sb1", "Sara Beauty", "Leader", "Hey, thanks for the review! I really liked the cut.", "04:15 PM", 4)
            ))
            put("abel_tech_dm", mutableStateListOf(
                ChatMessage("at1", "Abel Tech", "Developer", "I am working on the withdrawal request integration.", "03:10 PM", 2)
            ))
            put("ethio_birr_finance", mutableStateListOf(
                ChatMessage("eb1", "Finances", "System", "Your recent withdrawal of 14,000 ETB has been successfully processed.", "Last week", 15),
                ChatMessage("eb2", "Finances", "System", "Withdrawal of 14,000 ETB has been completed.", "Yesterday", 7)
            ))
        }
    }

    var showNewThreadDialog by remember { mutableStateOf(false) }
    var newThreadName by remember { mutableStateOf("") }
    var newThreadMessage by remember { mutableStateOf("") }
    var newThreadCategory by remember { mutableStateOf("dm") } // Default to direct message

    if (showNewThreadDialog) {
        AlertDialog(
            onDismissRequest = { showNewThreadDialog = false },
            title = {
                Text(
                    text = "Start Conversation",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF110D59)
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = newThreadName,
                        onValueChange = { newThreadName = it },
                        label = { Text("Name / Subject") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = newThreadMessage,
                        onValueChange = { newThreadMessage = it },
                        label = { Text("First Message Preview") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    
                    Text("Select Chat Type:", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF110D59))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf("community" to "Channel", "group" to "Group", "dm" to "Direct Msg").forEach { (type, label) ->
                            val isSel = newThreadCategory == type
                            FilterChip(
                                selected = isSel,
                                onClick = { newThreadCategory = type },
                                label = { Text(label, fontSize = 11.sp) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = Color(0xFFFEB209).copy(alpha = 0.2f),
                                    selectedLabelColor = Color(0xFF110D59)
                                )
                            )
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newThreadName.isNotBlank() && newThreadMessage.isNotBlank()) {
                            val newId = "thread_" + System.currentTimeMillis()
                            threads.add(
                                ChatThreadItem(
                                    id = newId,
                                    name = newThreadName,
                                    previewMessage = newThreadMessage,
                                    category = newThreadCategory,
                                    unreadCount = 0,
                                    isPinned = false,
                                    avatarIcon = if (newThreadCategory == "community") Icons.Default.Forum else if (newThreadCategory == "group") Icons.Default.Campaign else Icons.Default.Person
                                )
                            )
                            threadMessagesMap[newId] = mutableStateListOf(
                                ChatMessage(
                                    id = "msg_" + System.currentTimeMillis(),
                                    senderName = "You",
                                    senderRole = "Creator",
                                    messageText = newThreadMessage,
                                    time = "Just now",
                                    reactions = 0
                                )
                            )
                            showNewThreadDialog = false
                            newThreadName = ""
                            newThreadMessage = ""
                            Toast.makeText(context, "New chat thread started!", Toast.LENGTH_SHORT).show()
                        } else {
                            Toast.makeText(context, "All fields are required.", Toast.LENGTH_SHORT).show()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF110D59))
                ) {
                    Text("Start", color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = { showNewThreadDialog = false }) {
                    Text("Cancel", color = Color(0xFF5F5C8C))
                }
            },
            containerColor = Color.White
        )
    }

    if (selectedThreadId == null) {
        // --- CHAT LIST SCREEN VIEW (NO BOTTOM NAV HIDING) ---
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White)
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Header with custom primary dark blue background (Matches Profile & Home screens)
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF0A1140)) // Top bold navy blue
                        .padding(top = 48.dp, start = 20.dp, end = 20.dp, bottom = 24.dp)
                ) {
                    Text(
                        text = "Vite Messenger",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(14.dp))
                    
                    // Full-width Search Bar with rounded corners & yellow magnifying glass icon
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .background(Color.White.copy(alpha = 0.1f), RoundedCornerShape(24.dp))
                            .border(1.dp, Color.White.copy(alpha = 0.15f), RoundedCornerShape(24.dp))
                            .padding(horizontal = 16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Search",
                            tint = Color(0xFFFEB209), // Tertiary Yellow Accent
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        
                        androidx.compose.foundation.text.BasicTextField(
                            value = searchQuery,
                            onValueChange = { searchQuery = it },
                            singleLine = true,
                            textStyle = androidx.compose.ui.text.TextStyle(color = Color.White, fontSize = 14.sp),
                            modifier = Modifier.fillMaxWidth(),
                            decorationBox = { innerTextField ->
                                Box(modifier = Modifier.fillMaxWidth()) {
                                    if (searchQuery.isEmpty()) {
                                        Text(
                                            text = "Search chats and communities...",
                                            color = Color.White.copy(alpha = 0.5f),
                                            fontSize = 14.sp
                                        )
                                    }
                                    innerTextField()
                                }
                            }
                        )
                    }
                }

                // Filtering of threads
                val filteredThreads = threads.filter {
                    it.name.contains(searchQuery, ignoreCase = true) ||
                    it.previewMessage.contains(searchQuery, ignoreCase = true)
                }

                if (filteredThreads.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                imageVector = Icons.Default.Chat,
                                contentDescription = null,
                                tint = Color(0xFFB4B0D5),
                                modifier = Modifier.size(64.dp)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "No conversations found",
                                fontSize = 14.sp,
                                color = Color(0xFF5F5C8C),
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                } else {
                    // Unified scrollable feed with clean group headings (Telegram style)
                    LazyColumn(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth()
                            .background(Color.White)
                    ) {
                        val communities = filteredThreads.filter { it.category == "community" }
                        val groups = filteredThreads.filter { it.category == "group" }
                        val dms = filteredThreads.filter { it.category == "dm" }

                        // 1. COMMUNITIES SECTION
                        if (communities.isNotEmpty()) {
                            item {
                                SectionHeader(title = "COMMUNITIES & HUBS", icon = Icons.Default.Forum)
                            }
                            items(communities) { thread ->
                                ThreadListItemRow(
                                    thread = thread,
                                    onClick = {
                                        // Reset unread count upon click
                                        val idx = threads.indexOfFirst { it.id == thread.id }
                                        if (idx != -1) {
                                            threads[idx] = threads[idx].copy(unreadCount = 0)
                                        }
                                        selectedThreadId = thread.id
                                    }
                                )
                                DividerLine()
                            }
                        }

                        // 2. GROUPS & SPONSORS SECTION
                        if (groups.isNotEmpty()) {
                            item {
                                SectionHeader(title = "SPONSORS & GROUPS", icon = Icons.Default.Campaign)
                            }
                            items(groups) { thread ->
                                ThreadListItemRow(
                                    thread = thread,
                                    onClick = {
                                        val idx = threads.indexOfFirst { it.id == thread.id }
                                        if (idx != -1) {
                                            threads[idx] = threads[idx].copy(unreadCount = 0)
                                        }
                                        selectedThreadId = thread.id
                                    }
                                )
                                DividerLine()
                            }
                        }

                        // 3. DIRECT MESSAGES SECTION
                        if (dms.isNotEmpty()) {
                            item {
                                SectionHeader(title = "DIRECT MESSAGES", icon = Icons.Default.Person)
                            }
                            items(dms) { thread ->
                                ThreadListItemRow(
                                    thread = thread,
                                    onClick = {
                                        val idx = threads.indexOfFirst { it.id == thread.id }
                                        if (idx != -1) {
                                            threads[idx] = threads[idx].copy(unreadCount = 0)
                                        }
                                        selectedThreadId = thread.id
                                    }
                                )
                                DividerLine()
                            }
                        }
                    }
                }
            }

            // Circular Floating Action Button at bottom right corner (Telegram style)
            Box(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(24.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF110D59)) // Brand navy
                        .clickable { showNewThreadDialog = true }
                        .border(1.5.dp, Color.White, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "New Thread",
                        tint = Color(0xFFFEB209), // Tertiary Yellow Accent
                        modifier = Modifier.size(28.dp)
                    )
                }
            }
        }
    } else {
        // --- CHAT CONVERSATION DETAIL VIEW (BOTTOM NAV BAR HIDDEN!) ---
        val threadId = selectedThreadId!!
        val currentThread = threads.find { it.id == threadId } ?: threads[0]
        val activeMessages = threadMessagesMap[threadId] ?: remember { mutableStateListOf() }
        var typedMessage by remember { mutableStateOf("") }

        val playingVoiceMessages = remember { mutableStateMapOf<String, Boolean>() }
        val voicePlaybackSeconds = remember { mutableStateMapOf<String, Int>() }

        var isRecordingVoice by remember { mutableStateOf(false) }
        var recordingSeconds by remember { mutableStateOf(0) }

        LaunchedEffect(isRecordingVoice) {
            if (isRecordingVoice) {
                recordingSeconds = 0
                while (isRecordingVoice) {
                    delay(1000)
                    recordingSeconds++
                }
            }
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White)
        ) {
            // Detailed Chat Header with intense corporate navy
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF0A1140)) // Primary intense dark navy blue
                    .padding(top = 48.dp, start = 8.dp, end = 16.dp, bottom = 16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = { selectedThreadId = null }) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = Color.White
                    )
                }
                
                // Thick solid white circular ring avatar inside detail header
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .border(2.dp, Color.White, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    if (currentThread.avatarRes != null) {
                        androidx.compose.foundation.Image(
                            painter = androidx.compose.ui.res.painterResource(id = currentThread.avatarRes),
                            contentDescription = null,
                            modifier = Modifier.fillMaxSize().clip(CircleShape),
                            contentScale = androidx.compose.ui.layout.ContentScale.Crop
                        )
                    } else if (currentThread.avatarIcon != null) {
                        Box(
                            modifier = Modifier.fillMaxSize().background(Color.White.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = currentThread.avatarIcon,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    } else if (currentThread.avatarText != null) {
                        Box(
                            modifier = Modifier.fillMaxSize().background(Color(0xFFFEB209)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "ETB",
                                color = Color(0xFF0A1140),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
                
                Spacer(modifier = Modifier.width(12.dp))
                
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = currentThread.name,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = "online • Telegram Integration",
                        fontSize = 11.sp,
                        color = Color.White.copy(alpha = 0.6f)
                    )
                }
            }

            // Message list body
            val listState = rememberLazyListState()
            LaunchedEffect(activeMessages.size) {
                if (activeMessages.isNotEmpty()) {
                    listState.animateScrollToItem(activeMessages.size - 1)
                }
            }

            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .background(Color(0xFFF1F5F9)) // Soft gray background inside chat log
            ) {
                LazyColumn(
                    state = listState,
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 14.dp, vertical = 10.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(activeMessages) { msg ->
                        val isYou = msg.senderName == "You"
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = if (isYou) Arrangement.End else Arrangement.Start,
                            verticalAlignment = Alignment.Top
                        ) {
                            if (!isYou) {
                                // Mini avatar inside detail bubbles with white ring
                                Box(
                                    modifier = Modifier
                                        .size(32.dp)
                                        .clip(CircleShape)
                                        .background(Color(0xFF110D59))
                                        .border(1.5.dp, Color.White, CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = msg.senderName.take(1),
                                        color = Color.White,
                                        fontSize = 12.sp,
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
                                        containerColor = if (isYou) Color(0xFF110D59) else Color.White
                                    ),
                                    shape = RoundedCornerShape(
                                        topStart = 16.dp,
                                        topEnd = 16.dp,
                                        bottomStart = if (isYou) 16.dp else 4.dp,
                                        bottomEnd = if (isYou) 4.dp else 16.dp
                                    ),
                                    border = if (isYou) null else BorderStroke(0.5.dp, Color(0xFFE2E8F0)),
                                    elevation = CardDefaults.cardElevation(defaultElevation = 0.5.dp)
                                ) {
                                    Column(modifier = Modifier.padding(12.dp)) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text(
                                                text = msg.senderName,
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = if (isYou) Color(0xFFFEB209) else Color(0xFF110D59)
                                            )
                                            Spacer(modifier = Modifier.width(16.dp))
                                            Text(
                                                text = msg.time,
                                                fontSize = 9.sp,
                                                color = if (isYou) Color.White.copy(alpha = 0.7f) else Color.Gray
                                            )
                                        }

                                        Spacer(modifier = Modifier.height(4.dp))

                                        if (msg.isVoice) {
                                            val isPlaying = playingVoiceMessages[msg.id] ?: false
                                            val currentSec = voicePlaybackSeconds[msg.id] ?: 0
                                            val totalSec = msg.voiceDurationSeconds
                                            
                                            LaunchedEffect(isPlaying) {
                                                if (isPlaying) {
                                                    while (playingVoiceMessages[msg.id] == true) {
                                                        delay(1000)
                                                        val current = voicePlaybackSeconds[msg.id] ?: 0
                                                        if (current < totalSec) {
                                                            voicePlaybackSeconds[msg.id] = current + 1
                                                        } else {
                                                            voicePlaybackSeconds[msg.id] = 0
                                                            playingVoiceMessages[msg.id] = false
                                                        }
                                                    }
                                                }
                                            }

                                            Row(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .padding(vertical = 4.dp),
                                                verticalAlignment = Alignment.CenterVertically,
                                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                                            ) {
                                                IconButton(
                                                    onClick = { playingVoiceMessages[msg.id] = !isPlaying },
                                                    modifier = Modifier
                                                        .size(32.dp)
                                                        .background(
                                                            if (isYou) Color.White.copy(alpha = 0.2f) else Color(0xFF110D59).copy(alpha = 0.1f),
                                                            CircleShape
                                                        )
                                                ) {
                                                    Icon(
                                                        imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                                                        contentDescription = null,
                                                        tint = if (isYou) Color.White else Color(0xFF110D59),
                                                        modifier = Modifier.size(18.dp)
                                                    )
                                                }
                                                
                                                Column(modifier = Modifier.weight(1f)) {
                                                    Box(
                                                        modifier = Modifier
                                                            .fillMaxWidth()
                                                            .height(4.dp)
                                                            .background(
                                                                if (isYou) Color.White.copy(alpha = 0.3f) else Color.Gray.copy(alpha = 0.3f),
                                                                RoundedCornerShape(2.dp)
                                                            )
                                                    ) {
                                                        val fraction = if (totalSec > 0) currentSec.toFloat() / totalSec else 0f
                                                        Box(
                                                            modifier = Modifier
                                                                .fillMaxHeight()
                                                                .fillMaxWidth(fraction)
                                                                .background(
                                                                    if (isYou) Color.White else Color(0xFF110D59),
                                                                    RoundedCornerShape(2.dp)
                                                                )
                                                        )
                                                    }
                                                    Spacer(modifier = Modifier.height(4.dp))
                                                    Text(
                                                        text = "Voice msg • ${currentSec}s / ${totalSec}s",
                                                        fontSize = 9.sp,
                                                        color = if (isYou) Color.White.copy(alpha = 0.8f) else Color.Gray
                                                    )
                                                }
                                            }
                                        } else {
                                            Text(
                                                text = msg.messageText,
                                                fontSize = 13.sp,
                                                color = if (isYou) Color.White else Color(0xFF1E293B)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Message Input Bottom Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 8.dp)
                    .background(Color.White, RoundedCornerShape(24.dp))
                    .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(24.dp))
                    .padding(horizontal = 12.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                if (isRecordingVoice) {
                    Row(
                        modifier = Modifier.weight(1f),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .background(Color.Red, CircleShape)
                        )
                        Text(
                            text = "Voice Recording... ${recordingSeconds}s",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.Red
                        )
                    }

                    IconButton(onClick = { isRecordingVoice = false }) {
                        Icon(imageVector = Icons.Default.Delete, contentDescription = null, tint = Color.Red)
                    }

                    IconButton(
                        onClick = {
                            isRecordingVoice = false
                            if (recordingSeconds > 0) {
                                activeMessages.add(
                                    ChatMessage(
                                        id = "voice_" + System.currentTimeMillis(),
                                        senderName = "You",
                                        senderRole = "Creator",
                                        messageText = "Voice Message",
                                        time = "Just now",
                                        reactions = 0,
                                        isVoice = true,
                                        voiceDurationSeconds = recordingSeconds
                                    )
                                )
                                coroutineScope.launch {
                                    delay(1200)
                                    activeMessages.add(
                                        ChatMessage(
                                            id = "reply_" + System.currentTimeMillis(),
                                            senderName = currentThread.name.split(" ")[0],
                                            senderRole = "Leader",
                                            messageText = "Perfect voice note! Recorded clearly.",
                                            time = "Just now",
                                            reactions = 0
                                        )
                                    )
                                }
                            }
                        }
                    ) {
                        Icon(imageVector = Icons.Default.Check, contentDescription = null, tint = Color(0xFF10B981))
                    }
                } else {
                    IconButton(
                        onClick = {
                            Toast.makeText(context, "Attachments uploaded securely to Content CDN.", Toast.LENGTH_SHORT).show()
                        }
                    ) {
                        Icon(imageVector = Icons.Default.AttachFile, contentDescription = null, tint = Color(0xFF5F5C8C))
                    }

                    OutlinedTextField(
                        value = typedMessage,
                        onValueChange = { typedMessage = it },
                        placeholder = { Text("Write your message...", color = Color(0xFF5F5C8C).copy(alpha = 0.6f), fontSize = 13.sp) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color.Transparent,
                            unfocusedBorderColor = Color.Transparent,
                            focusedTextColor = Color(0xFF110D59),
                            unfocusedTextColor = Color(0xFF110D59),
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent
                        ),
                        modifier = Modifier.weight(1f),
                        maxLines = 3
                    )

                    if (typedMessage.isBlank()) {
                        IconButton(onClick = { isRecordingVoice = true }) {
                            Icon(imageVector = Icons.Default.Mic, contentDescription = null, tint = Color(0xFF110D59))
                        }
                    } else {
                        IconButton(
                            onClick = {
                                val text = typedMessage.trim()
                                typedMessage = ""
                                activeMessages.add(
                                    ChatMessage(
                                        id = "msg_" + System.currentTimeMillis(),
                                        senderName = "You",
                                        senderRole = "Creator",
                                        messageText = text,
                                        time = "Just now",
                                        reactions = 0
                                    )
                                )
                                coroutineScope.launch {
                                    delay(1200)
                                    activeMessages.add(
                                        ChatMessage(
                                            id = "reply_" + System.currentTimeMillis(),
                                            senderName = currentThread.name.split(" ")[0],
                                            senderRole = "Support",
                                            messageText = "Got your message! Let's schedule a call to sync about this.",
                                            time = "Just now",
                                            reactions = 0
                                        )
                                    )
                                }
                            }
                        ) {
                            Icon(imageVector = Icons.Default.Send, contentDescription = null, tint = Color(0xFF110D59))
                        }
                    }
                }
            }
        }
    }
}

// ---------------------- LIST SUB-COMPONENTS ----------------------

@Composable
fun SectionHeader(title: String, icon: ImageVector) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 16.dp, bottom = 8.dp, start = 16.dp, end = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = Color(0xFF110D59).copy(alpha = 0.6f),
            modifier = Modifier.size(16.dp)
        )
        Text(
            text = title,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF110D59).copy(alpha = 0.6f)
        )
    }
}

@Composable
fun DividerLine() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(1.dp)
            .background(Color(0xFFF1F5F9))
    )
}

@Composable
fun ThreadListItemRow(
    thread: ChatThreadItem,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Thick circular solid White border around avatars
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(CircleShape)
                .background(Color.White)
                .border(2.dp, Color.White, CircleShape), // Contrast white border ring
            contentAlignment = Alignment.Center
        ) {
            if (thread.avatarRes != null) {
                androidx.compose.foundation.Image(
                    painter = androidx.compose.ui.res.painterResource(id = thread.avatarRes),
                    contentDescription = null,
                    modifier = Modifier.fillMaxSize().clip(CircleShape),
                    contentScale = androidx.compose.ui.layout.ContentScale.Crop
                )
            } else if (thread.avatarIcon != null) {
                Box(
                    modifier = Modifier.fillMaxSize().background(Color(0xFF110D59).copy(alpha = 0.08f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = thread.avatarIcon,
                        contentDescription = null,
                        tint = Color(0xFF110D59),
                        modifier = Modifier.size(20.dp)
                    )
                }
            } else if (thread.avatarText != null) {
                Box(
                    modifier = Modifier.fillMaxSize().background(Color(0xFFFEB209).copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "ETB",
                        color = Color(0xFF110D59),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.width(14.dp))

        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = thread.name,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF110D59)
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = thread.previewMessage,
                fontSize = 12.sp,
                color = Color(0xFF5F5C8C),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }

        Spacer(modifier = Modifier.width(8.dp))

        Column(
            horizontalAlignment = Alignment.End,
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            if (thread.unreadCount > 0) {
                Box(
                    modifier = Modifier
                        .size(18.dp)
                        .background(Color(0xFFFEB209), CircleShape), // Yellow unread count
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = thread.unreadCount.toString(),
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF110D59)
                    )
                }
            }
            if (thread.isPinned) {
                Icon(
                    imageVector = Icons.Default.PushPin,
                    contentDescription = null,
                    tint = Color(0xFFFEB209),
                    modifier = Modifier.size(12.dp)
                )
            }
        }
    }
}
