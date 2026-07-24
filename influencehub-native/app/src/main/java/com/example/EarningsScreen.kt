package com.example

import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

import com.example.ui.theme.*

@Composable
fun EarningsHubScreen() {
    val context = LocalContext.current
    var availableBalance by remember { mutableStateOf(128000.0) }
    var totalEarnings by remember { mutableStateOf(500000.0) }
    
    var inputAmount by remember { mutableStateOf("") }
    var selectedBank by remember { mutableStateOf("Commercial Bank of Ethiopia (CBE)") }
    var inputAccountNum by remember { mutableStateOf("1000192837483") }

    // Dialog & Secure Confirmation states
    var showPasswordDialog by remember { mutableStateOf(false) }
    var inputPassword by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var amountToWithdrawTemp by remember { mutableStateOf(0.0) }

    val bankOptions = listOf(
        "Commercial Bank of Ethiopia (CBE)",
        "Awash International Bank",
        "Dashen Bank S.C.",
        "Abyssinia Bank"
    )

    // Password validation Dialog
    if (showPasswordDialog) {
        AlertDialog(
            onDismissRequest = { showPasswordDialog = false },
            title = {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Lock,
                        contentDescription = "Security Lock",
                        tint = MidnightIndigo,
                        modifier = Modifier.size(24.dp)
                    )
                    Text(
                        text = "Password Confirmation",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MidnightIndigo
                    )
                }
            },
            text = {
                Column {
                    Text(
                        text = "To authorize a secure withdrawal of ${Formatters.formatCurrency(amountToWithdrawTemp)} to $selectedBank, please enter your password.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF5F5C8C)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedTextField(
                        value = inputPassword,
                        onValueChange = { inputPassword = it },
                        label = { Text("Enter Password", style = MaterialTheme.typography.labelMedium) },
                        visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        trailingIcon = {
                            IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                Icon(
                                    imageVector = if (passwordVisible) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                                    contentDescription = "Toggle Password Visibility",
                                    tint = Color(0xFF5F5C8C)
                                )
                            }
                        },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = MidnightIndigo,
                            unfocusedTextColor = MidnightIndigo,
                            focusedBorderColor = TelegramBlue,
                            unfocusedBorderColor = Color(0xFFCBD5E1),
                            focusedContainerColor = Color.White,
                            unfocusedContainerColor = Color.White
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (inputPassword.isBlank()) {
                            Toast.makeText(context, "Password cannot be empty.", Toast.LENGTH_SHORT).show()
                        } else if (inputPassword.length < 6) {
                            Toast.makeText(context, "Password must be at least 6 characters.", Toast.LENGTH_SHORT).show()
                        } else {
                            // Deduct the requested amount from live available balance state
                            availableBalance -= amountToWithdrawTemp
                            Toast.makeText(
                                context,
                                "Direct transfer of ${Formatters.formatCurrency(amountToWithdrawTemp)} successfully requested! $selectedBank clearing takes 24 hours.",
                                Toast.LENGTH_LONG
                            ).show()
                            inputAmount = ""
                            showPasswordDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MidnightIndigo),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Confirm Payout", color = Color.White, style = MaterialTheme.typography.labelLarge)
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { showPasswordDialog = false }
                ) {
                    Text("Cancel", color = Color(0xFF5F5C8C), style = MaterialTheme.typography.labelLarge)
                }
            },
            containerColor = Color.White,
            shape = RoundedCornerShape(16.dp)
        )
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Transparent)
            .statusBarsPadding()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Balance Display Container (Side-by-side with proper scaling)
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Card(
                    modifier = Modifier.weight(1f),
                    colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.15f)),
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(0.5.dp, Color.White.copy(alpha = 0.2f)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(text = "Available Balance", fontSize = 11.sp, color = Color.White.copy(alpha = 0.7f), fontWeight = FontWeight.Medium)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(text = Formatters.formatCurrency(availableBalance), fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(text = "${String.format("%,d", availableBalance.toInt())} Points", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = TelegramBlue)
                    }
                }

                Card(
                    modifier = Modifier.weight(1f),
                    colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.15f)),
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(0.5.dp, Color.White.copy(alpha = 0.2f)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(text = "Total Earnings", fontSize = 11.sp, color = Color.White.copy(alpha = 0.7f), fontWeight = FontWeight.Medium)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(text = Formatters.formatCurrency(totalEarnings), fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(text = "${String.format("%,d", totalEarnings.toInt())} Points", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = TelegramBlue)
                    }
                }
            }
        }

        // Bank payout configuration
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0x1AFFFFFF)),
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(0.5.dp, Color.White.copy(alpha = 0.15f)),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "Direct Bank Transfer Configuration", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    Spacer(modifier = Modifier.height(12.dp))

                    Text(text = "Select Domestic Bank", fontSize = 11.sp, color = Color.White.copy(alpha = 0.7f))
                    Spacer(modifier = Modifier.height(4.dp))

                    var expanded by remember { mutableStateOf(false) }
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color.White.copy(alpha = 0.1f), RoundedCornerShape(8.dp))
                            .border(1.dp, Color.White.copy(alpha = 0.25f), RoundedCornerShape(8.dp))
                            .clickable { expanded = true }
                            .padding(12.dp)
                    ) {
                        Text(text = selectedBank, color = Color.White, fontSize = 13.sp)
                        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                            bankOptions.forEach { bank ->
                                DropdownMenuItem(
                                    text = { Text(text = bank) },
                                    onClick = {
                                        selectedBank = bank
                                        expanded = false
                                    }
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(text = "Bank Account Number", fontSize = 11.sp, color = Color.White.copy(alpha = 0.7f))
                    Spacer(modifier = Modifier.height(4.dp))
                    OutlinedTextField(
                        value = inputAccountNum,
                        onValueChange = { inputAccountNum = it },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = Color.White,
                            unfocusedBorderColor = Color.White.copy(alpha = 0.3f),
                            focusedContainerColor = Color.White.copy(alpha = 0.1f),
                            unfocusedContainerColor = Color.White.copy(alpha = 0.05f)
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(text = "Amount to Withdraw (ETB)", fontSize = 11.sp, color = Color.White.copy(alpha = 0.7f))
                    Spacer(modifier = Modifier.height(4.dp))
                    OutlinedTextField(
                        value = inputAmount,
                        onValueChange = { inputAmount = it },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = Color.White,
                            unfocusedBorderColor = Color.White.copy(alpha = 0.3f),
                            focusedContainerColor = Color.White.copy(alpha = 0.1f),
                            unfocusedContainerColor = Color.White.copy(alpha = 0.05f)
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        placeholder = { Text(text = "E.g. 5000", color = Color.White.copy(alpha = 0.4f), fontSize = 12.sp) }
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Button(
                        onClick = {
                            val amt = inputAmount.toDoubleOrNull()
                            if (amt == null || amt <= 0) {
                                Toast.makeText(context, "Please enter a valid positive amount.", Toast.LENGTH_SHORT).show()
                            } else if (amt > availableBalance) {
                                Toast.makeText(context, "Insufficient available balance.", Toast.LENGTH_SHORT).show()
                            } else if (inputAccountNum.isBlank()) {
                                Toast.makeText(context, "Please enter your bank account number.", Toast.LENGTH_SHORT).show()
                            } else {
                                amountToWithdrawTemp = amt
                                inputPassword = ""
                                showPasswordDialog = true
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MidnightIndigo,
                            contentColor = Color.White
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(text = "Confirm Wallet Withdrawal", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun EarningsHubScreenPreview() {
    MyApplicationTheme {
        EarningsHubScreen()
    }
}
