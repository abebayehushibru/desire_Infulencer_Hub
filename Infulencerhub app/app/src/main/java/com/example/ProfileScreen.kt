package com.example

import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R

@Composable
fun ProfileWaveHeader(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val width = size.width
        val height = size.height

        // Background Wave (Lighter Purple/Lavender accent)
        val path1 = Path().apply {
            moveTo(0f, height)
            lineTo(0f, height * 0.2f)
            cubicTo(
                width * 0.25f, height * -0.3f,
                width * 0.75f, height * 0.8f,
                width, height * 0.3f
            )
            lineTo(width, height)
            close()
        }
        drawPath(path1, color = Color(0xFF2E1C8D).copy(alpha = 0.35f))

        // Foreground Wave (Dark Navy, blending into the content section background)
        val path2 = Path().apply {
            moveTo(0f, height)
            lineTo(0f, height * 0.5f)
            cubicTo(
                width * 0.35f, height * 0.1f,
                width * 0.65f, height * 1.1f,
                width, height * 0.4f
            )
            lineTo(width, height)
            close()
        }
        drawPath(path2, color = Color(0xFF110D59))
    }
}

@Composable
fun ChevronRightIcon(
    modifier: Modifier = Modifier,
    color: Color = Color(0xFF16115A)
) {
    Canvas(modifier = modifier) {
        val width = size.width
        val height = size.height
        val strokeWidth = 2.dp.toPx()
        
        val path = Path().apply {
            moveTo(width * 0.35f, height * 0.25f)
            lineTo(width * 0.65f, height * 0.5f)
            lineTo(width * 0.35f, height * 0.75f)
        }
        
        drawPath(
            path = path,
            color = color,
            style = Stroke(
                width = strokeWidth,
                cap = androidx.compose.ui.graphics.StrokeCap.Round,
                join = androidx.compose.ui.graphics.StrokeJoin.Round
            )
        )
    }
}

@Composable
fun ProfileMenuItem(
    title: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 12.dp, horizontal = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = title,
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF110D59)
        )
        ChevronRightIcon(
            modifier = Modifier.size(18.dp),
            color = Color(0xFF110D59)
        )
    }
}

@Composable
fun SessionDetailRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF475569)
        )
        Text(
            text = value,
            fontSize = 11.sp,
            fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
            color = Color(0xFF0F172A)
        )
    }
}

@Composable
fun ProfileScreen(loggedInPhone: String, onLogout: () -> Unit) {
    val context = LocalContext.current

    // Stateful User Details
    var personalName by remember { mutableStateOf("Desire Influencer Hub Node") }
    var personalNiche by remember { mutableStateOf("Tech, Lifestyle & Creative") }
    var personalPlatforms by remember { mutableStateOf("TikTok, Instagram, YouTube") }
    var personalRate by remember { mutableStateOf("1,500 ETB per post") }

    var bankName by remember { mutableStateOf("Commercial Bank of Ethiopia (CBE)") }
    var bankAccountNum by remember { mutableStateOf("1000192837483") }
    var bankHolderName by remember { mutableStateOf("Desire Influencer Hub") }

    var returnStreet by remember { mutableStateOf("Bole Road, Ward 3, House 402") }
    var returnCity by remember { mutableStateOf("Addis Ababa") }
    var returnZip by remember { mutableStateOf("1000") }
    var returnCountry by remember { mutableStateOf("Ethiopia") }

    var userEmailAddress by remember { mutableStateOf(if (loggedInPhone.contains("@")) loggedInPhone else "google.user@gmail.com") }

    // Dialog trigger states
    var showPersonalInfoDialog by remember { mutableStateOf(false) }
    var showBankInfoDialog by remember { mutableStateOf(false) }
    var showReturnAddressDialog by remember { mutableStateOf(false) }
    var showChangePasswordDialog by remember { mutableStateOf(false) }
    var showChangeEmailDialog by remember { mutableStateOf(false) }
    var showSecureSessionDialog by remember { mutableStateOf(false) }

    // Input states for dialog modifications
    var inputName by remember { mutableStateOf("") }
    var inputNiche by remember { mutableStateOf("") }
    var inputPlatforms by remember { mutableStateOf("") }
    var inputRate by remember { mutableStateOf("") }

    var inputBankName by remember { mutableStateOf("") }
    var inputBankAccountNum by remember { mutableStateOf("") }
    var inputBankHolderName by remember { mutableStateOf("") }

    var inputReturnStreet by remember { mutableStateOf("") }
    var inputReturnCity by remember { mutableStateOf("") }
    var inputReturnZip by remember { mutableStateOf("") }
    var inputReturnCountry by remember { mutableStateOf("") }

    var inputOldPassword by remember { mutableStateOf("") }
    var inputNewPassword by remember { mutableStateOf("") }
    var inputConfirmPassword by remember { mutableStateOf("") }

    var inputNewEmail by remember { mutableStateOf("") }

    // Dialogs implementations
    if (showSecureSessionDialog) {
        val details = SecureSessionManager.getSessionDetails(context)
        AlertDialog(
            onDismissRequest = { showSecureSessionDialog = false },
            title = {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Security,
                        contentDescription = "Security Status",
                        tint = Color(0xFF2E1C8D),
                        modifier = Modifier.size(24.dp)
                    )
                    Text(
                        text = "Secure Session Center",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF16115A)
                    )
                }
            },
            text = {
                Column(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Your active session is cryptographically secured on this device.",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color(0xFF5F5C8C)
                    )
                    
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFF1F5F9), RoundedCornerShape(8.dp))
                            .padding(12.dp)
                    ) {
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            SessionDetailRow("Operator", details["email"] ?: "N/A")
                            SessionDetailRow("Encryption", details["cryptoLevel"] ?: "N/A")
                            SessionDetailRow("Session Token", details["token"] ?: "N/A")
                            SessionDetailRow("Remember Me", details["rememberMe"] ?: "N/A")
                            SessionDetailRow("Logged In At", details["loginTime"] ?: "N/A")
                            SessionDetailRow("Expires At", details["expiresAt"] ?: "N/A")
                        }
                    }

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFECFDF5), RoundedCornerShape(6.dp))
                            .padding(8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Verified Status",
                            tint = Color(0xFF10B981),
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "Status: Secured & Active",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF047857)
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = { showSecureSessionDialog = false },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E1C8D))
                ) {
                    Text("Close Panel")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        showSecureSessionDialog = false
                        onLogout()
                    }
                ) {
                    Text("Revoke Session", color = Color(0xFFEF4444), fontWeight = FontWeight.Bold)
                }
            }
        )
    }

    if (showPersonalInfoDialog) {
        AlertDialog(
            onDismissRequest = { showPersonalInfoDialog = false },
            title = {
                Text(
                    text = "Edit Personal Info",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF16115A)
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = inputName,
                        onValueChange = { inputName = it },
                        label = { Text("Display Name") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = inputNiche,
                        onValueChange = { inputNiche = it },
                        label = { Text("Creator Niche") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = inputPlatforms,
                        onValueChange = { inputPlatforms = it },
                        label = { Text("Active Platforms") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = inputRate,
                        onValueChange = { inputRate = it },
                        label = { Text("Minimum Posting Rate") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (inputName.isNotBlank()) personalName = inputName
                        if (inputNiche.isNotBlank()) personalNiche = inputNiche
                        if (inputPlatforms.isNotBlank()) personalPlatforms = inputPlatforms
                        if (inputRate.isNotBlank()) personalRate = inputRate
                        showPersonalInfoDialog = false
                        Toast.makeText(context, "Personal Info Updated!", Toast.LENGTH_SHORT).show()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E1C8D))
                ) {
                    Text("Save Changes")
                }
            },
            dismissButton = {
                TextButton(onClick = { showPersonalInfoDialog = false }) {
                    Text("Cancel", color = Color(0xFF5F5C8C))
                }
            },
            containerColor = Color.White
        )
    }

    if (showBankInfoDialog) {
        AlertDialog(
            onDismissRequest = { showBankInfoDialog = false },
            title = {
                Text(
                    text = "Bank Account Info",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF16115A)
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = inputBankName,
                        onValueChange = { inputBankName = it },
                        label = { Text("Bank Name") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = inputBankAccountNum,
                        onValueChange = { inputBankAccountNum = it },
                        label = { Text("Account Number") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = inputBankHolderName,
                        onValueChange = { inputBankHolderName = it },
                        label = { Text("Account Holder Name") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (inputBankName.isNotBlank()) bankName = inputBankName
                        if (inputBankAccountNum.isNotBlank()) bankAccountNum = inputBankAccountNum
                        if (inputBankHolderName.isNotBlank()) bankHolderName = inputBankHolderName
                        showBankInfoDialog = false
                        Toast.makeText(context, "Bank Details Updated!", Toast.LENGTH_SHORT).show()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E1C8D))
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { showBankInfoDialog = false }) {
                    Text("Cancel", color = Color(0xFF5F5C8C))
                }
            },
            containerColor = Color.White
        )
    }

    if (showReturnAddressDialog) {
        AlertDialog(
            onDismissRequest = { showReturnAddressDialog = false },
            title = {
                Text(
                    text = "Return Address Info",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF16115A)
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = inputReturnStreet,
                        onValueChange = { inputReturnStreet = it },
                        label = { Text("Street Address") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = inputReturnCity,
                        onValueChange = { inputReturnCity = it },
                        label = { Text("City / State") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = inputReturnZip,
                        onValueChange = { inputReturnZip = it },
                        label = { Text("Postal / ZIP Code") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = inputReturnCountry,
                        onValueChange = { inputReturnCountry = it },
                        label = { Text("Country") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (inputReturnStreet.isNotBlank()) returnStreet = inputReturnStreet
                        if (inputReturnCity.isNotBlank()) returnCity = inputReturnCity
                        if (inputReturnZip.isNotBlank()) returnZip = inputReturnZip
                        if (inputReturnCountry.isNotBlank()) returnCountry = inputReturnCountry
                        showReturnAddressDialog = false
                        Toast.makeText(context, "Return Address Updated!", Toast.LENGTH_SHORT).show()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E1C8D))
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { showReturnAddressDialog = false }) {
                    Text("Cancel", color = Color(0xFF5F5C8C))
                }
            },
            containerColor = Color.White
        )
    }

    if (showChangePasswordDialog) {
        AlertDialog(
            onDismissRequest = { showChangePasswordDialog = false },
            title = {
                Text(
                    text = "Change Security Password",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF16115A)
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = inputOldPassword,
                        onValueChange = { inputOldPassword = it },
                        label = { Text("Current Password") },
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = inputNewPassword,
                        onValueChange = { inputNewPassword = it },
                        label = { Text("New Password") },
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = inputConfirmPassword,
                        onValueChange = { inputConfirmPassword = it },
                        label = { Text("Confirm New Password") },
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (inputOldPassword.isBlank() || inputNewPassword.isBlank()) {
                            Toast.makeText(context, "All password fields are required.", Toast.LENGTH_SHORT).show()
                        } else if (inputNewPassword != inputConfirmPassword) {
                            Toast.makeText(context, "New passwords do not match.", Toast.LENGTH_SHORT).show()
                        } else {
                            showChangePasswordDialog = false
                            Toast.makeText(context, "Password changed successfully!", Toast.LENGTH_SHORT).show()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E1C8D))
                ) {
                    Text("Update Password")
                }
            },
            dismissButton = {
                TextButton(onClick = { showChangePasswordDialog = false }) {
                    Text("Cancel", color = Color(0xFF5F5C8C))
                }
            },
            containerColor = Color.White
        )
    }

    if (showChangeEmailDialog) {
        AlertDialog(
            onDismissRequest = { showChangeEmailDialog = false },
            title = {
                Text(
                    text = "Update Email Address",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF16115A)
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "Current Email: $userEmailAddress",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF5F5C8C)
                    )
                    OutlinedTextField(
                        value = inputNewEmail,
                        onValueChange = { inputNewEmail = it },
                        label = { Text("New Email Address") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (inputNewEmail.isBlank() || !inputNewEmail.contains("@")) {
                            Toast.makeText(context, "Please enter a valid email address.", Toast.LENGTH_SHORT).show()
                        } else {
                            userEmailAddress = inputNewEmail
                            showChangeEmailDialog = false
                            Toast.makeText(context, "Email Address Updated!", Toast.LENGTH_SHORT).show()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E1C8D))
                ) {
                    Text("Update Email")
                }
            },
            dismissButton = {
                TextButton(onClick = { showChangeEmailDialog = false }) {
                    Text("Cancel", color = Color(0xFF5F5C8C))
                }
            },
            containerColor = Color.White
        )
    }

    // Main scrollable content
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
    ) {
        // 1. HEADER SECTION (Navy Blue Background with Row Layout)
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF110D59))
                    .padding(top = 48.dp, bottom = 48.dp, start = 24.dp, end = 24.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Profile Image Container with thick solid white circular ring
                    Box(
                        contentAlignment = Alignment.BottomEnd,
                        modifier = Modifier.size(92.dp)
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.img_sara_beauty_1783538902631),
                            contentDescription = "My Avatar",
                            modifier = Modifier
                                .size(86.dp)
                                .clip(CircleShape)
                                .border(3.dp, Color.White, CircleShape),
                            contentScale = ContentScale.Crop
                        )
                        
                        // Edit pencil circular icon overlay
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier
                                .size(28.dp)
                                .clip(CircleShape)
                                .background(Color.White)
                                .border(1.dp, Color(0xFFCBD5E1), CircleShape)
                                .clickable {
                                    Toast.makeText(context, "Profile Avatar editor launched! Select a new image.", Toast.LENGTH_SHORT).show()
                                }
                        ) {
                            Icon(
                                imageVector = Icons.Default.Edit,
                                contentDescription = "Edit Profile Image",
                                tint = Color(0xFF110D59),
                                modifier = Modifier.size(14.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(18.dp))

                    // Name and ID next to avatar in clean White
                    Column {
                        Text(
                            text = personalName,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "ID: #783538 • Premium Influencer",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color.White.copy(alpha = 0.8f)
                        )
                    }
                }
            }
        }

        // 2. THE LOWER SETTINGS SECTION (Account Setting / Bank Setting with solid contrast text)
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Category Header: Account Setting
                Text(
                    text = "Account Setting",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF110D59),
                    modifier = Modifier.padding(start = 4.dp, top = 8.dp)
                )

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC)),
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(0.5.dp, Color(0xFFE2E8F0)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        ProfileMenuItem(
                            title = "Personal Info",
                            onClick = {
                                inputName = personalName
                                inputNiche = personalNiche
                                inputPlatforms = personalPlatforms
                                inputRate = personalRate
                                showPersonalInfoDialog = true
                            }
                        )
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(1.dp)
                                .background(Color(0xFFE2E8F0))
                        )

                        ProfileMenuItem(
                            title = "Change Password",
                            onClick = {
                                inputOldPassword = ""
                                inputNewPassword = ""
                                inputConfirmPassword = ""
                                showChangePasswordDialog = true
                            }
                        )
                    }
                }

                // Category Header: Bank Setting
                Text(
                    text = "Bank Setting",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF110D59),
                    modifier = Modifier.padding(start = 4.dp, top = 8.dp)
                )

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC)),
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(0.5.dp, Color(0xFFE2E8F0)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        ProfileMenuItem(
                            title = "Bank Account Info",
                            onClick = {
                                inputBankName = bankName
                                inputBankAccountNum = bankAccountNum
                                inputBankHolderName = bankHolderName
                                showBankInfoDialog = true
                            }
                        )
                    }
                }
            }
        }

        // 3. LOGOUT ACTION
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Button(
                    onClick = onLogout,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth().height(48.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Logout,
                        contentDescription = "Logout",
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "Logout", color = Color.White, style = MaterialTheme.typography.labelLarge)
                }
            }
        }
    }
}
