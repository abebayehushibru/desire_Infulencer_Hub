package com.example

import android.os.Bundle
import android.widget.Toast
import android.content.Context
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.CompositingStrategy
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*
import androidx.compose.ui.tooling.preview.Preview
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import androidx.compose.animation.core.*
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.interaction.collectIsHoveredAsState

import com.example.ui.theme.*

// ==========================================
// 1. NAVIGATION STATES & DATA MODELS
// ==========================================
enum class AppScreen {
    SPLASH,
    LOGIN,
    DASHBOARD
}

enum class MainTab {
    HOME,
    CAMPAIGNS,
    CHAT,
    EARNINGS,
    PROFILE
}

enum class CampaignSubTab {
    OVERVIEW,
    CAMPAIGNS,
    STATISTICS,
    REVIEWS
}

data class Campaign(
    val id: String,
    val title: String,
    val brandName: String,
    val category: String, // "Sales", "Awareness", "Growth"
    val rewardAmount: Double,
    var status: String, // "Open", "Claimed", "Completed", "Draft"
    val conversions: Int,
    val totalSpendETB: Double,
    val guidelines: List<String>
)

data class ChatMessage(
    val id: String,
    val senderName: String,
    val senderRole: String, // "Leader", "Gold Tier", "Creator"
    val messageText: String,
    val time: String,
    var reactions: Int,
    val isVoice: Boolean = false,
    val voiceDurationSeconds: Int = 0
)

data class ContentSubmission(
    val id: String,
    val url: String,
    val status: String, // "Pending Review", "Approved"
    val date: String
)

// ==========================================
// 2. SECURE SESSION MANAGER (KEYSTORE AES-256)
// ==========================================
object SecureSessionManager {
    private const val ANDROID_KEY_STORE = "AndroidKeyStore"
    private const val KEY_ALIAS = "InfluenceHubSecureSessionKey"
    private const val PREFS_NAME = "influence_hub_secure_prefs"
    private const val TRANSFORMATION = "AES/GCM/NoPadding"

    private const val KEY_ENCRYPTED_EMAIL = "enc_email"
    private const val KEY_ENCRYPTED_TOKEN = "enc_token"
    private const val KEY_SESSION_START = "session_start"
    private const val KEY_SESSION_DURATION = "session_duration"
    private const val KEY_REMEMBER_ME = "remember_me"

    private const val REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000L // 30 days
    private const val SHORT_SESSION_DURATION = 2 * 60 * 60 * 1000L // 2 hours

    private fun getSecretKey(): SecretKey? {
        return try {
            val keyStore = KeyStore.getInstance(ANDROID_KEY_STORE)
            keyStore.load(null)
            if (!keyStore.containsAlias(KEY_ALIAS)) {
                val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEY_STORE)
                val spec = KeyGenParameterSpec.Builder(
                    KEY_ALIAS,
                    KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
                )
                    .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                    .build()
                keyGenerator.init(spec)
                keyGenerator.generateKey()
            }
            keyStore.getKey(KEY_ALIAS, null) as? SecretKey
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun encrypt(plainText: String): String? {
        if (plainText.isEmpty()) return null
        return try {
            val secretKey = getSecretKey() ?: return null
            val cipher = Cipher.getInstance(TRANSFORMATION)
            cipher.init(Cipher.ENCRYPT_MODE, secretKey)
            val iv = cipher.iv
            val encryptedBytes = cipher.doFinal(plainText.toByteArray(Charsets.UTF_8))
            
            val ivBase64 = Base64.encodeToString(iv, Base64.NO_WRAP)
            val encryptedBase64 = Base64.encodeToString(encryptedBytes, Base64.NO_WRAP)
            "$ivBase64:$encryptedBase64"
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun decrypt(cipherTextWithIv: String): String? {
        if (cipherTextWithIv.isEmpty()) return null
        return try {
            val secretKey = getSecretKey() ?: return null
            val parts = cipherTextWithIv.split(":")
            if (parts.size != 2) return null
            val iv = Base64.decode(parts[0], Base64.NO_WRAP)
            val encryptedBytes = Base64.decode(parts[1], Base64.NO_WRAP)
            
            val cipher = Cipher.getInstance(TRANSFORMATION)
            val spec = GCMParameterSpec(128, iv)
            cipher.init(Cipher.DECRYPT_MODE, secretKey, spec)
            val decryptedBytes = cipher.doFinal(encryptedBytes)
            String(decryptedBytes, Charsets.UTF_8)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    fun saveSession(context: Context, email: String, rememberMe: Boolean, token: String = java.util.UUID.randomUUID().toString()) {
        try {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val encEmail = encrypt(email) ?: email
            val encToken = encrypt(token) ?: token
            val duration = if (rememberMe) REMEMBER_ME_DURATION else SHORT_SESSION_DURATION
            
            prefs.edit().apply {
                putString(KEY_ENCRYPTED_EMAIL, encEmail)
                putString(KEY_ENCRYPTED_TOKEN, encToken)
                putLong(KEY_SESSION_START, System.currentTimeMillis())
                putLong(KEY_SESSION_DURATION, duration)
                putBoolean(KEY_REMEMBER_ME, rememberMe)
                apply()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun isSessionValid(context: Context): Boolean {
        try {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val start = prefs.getLong(KEY_SESSION_START, 0L)
            val duration = prefs.getLong(KEY_SESSION_DURATION, 0L)
            val email = getSessionEmail(context)
            if (email.isNullOrEmpty() || start == 0L || duration == 0L) {
                return false
            }
            return (System.currentTimeMillis() - start) < duration
        } catch (e: Exception) {
            return false
        }
    }

    fun getSessionEmail(context: Context): String? {
        return try {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val encEmail = prefs.getString(KEY_ENCRYPTED_EMAIL, null) ?: return null
            if (encEmail.contains(":")) {
                decrypt(encEmail)
            } else {
                encEmail
            }
        } catch (e: Exception) {
            null
        }
    }

    fun getSessionToken(context: Context): String? {
        return try {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val encToken = prefs.getString(KEY_ENCRYPTED_TOKEN, null) ?: return null
            if (encToken.contains(":")) {
                decrypt(encToken)
            } else {
                encToken
            }
        } catch (e: Exception) {
            null
        }
    }

    fun getSessionDetails(context: Context): Map<String, String> {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val start = prefs.getLong(KEY_SESSION_START, 0L)
        val duration = prefs.getLong(KEY_SESSION_DURATION, 0L)
        val rememberMe = prefs.getBoolean(KEY_REMEMBER_ME, false)
        val email = getSessionEmail(context) ?: "N/A"
        val token = getSessionToken(context) ?: "N/A"
        val expiresAt = start + duration
        
        val df = java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", java.util.Locale.getDefault())
        
        return mapOf(
            "email" to email,
            "token" to if (token != "N/A") "${token.take(8)}...${token.takeLast(4)}" else "N/A",
            "rememberMe" to rememberMe.toString().replaceFirstChar { it.uppercase() },
            "loginTime" to if (start != 0L) df.format(java.util.Date(start)) else "N/A",
            "expiresAt" to if (duration != 0L) df.format(java.util.Date(expiresAt)) else "N/A",
            "cryptoLevel" to "Hardware Keystore AES-256-GCM"
        )
    }

    fun clearSession(context: Context) {
        try {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().clear().apply()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}

// ==========================================
// 3. UTILITIES & ANIMATION HELPERS
// ==========================================
object Validators {
    fun isValidEthiopianPhone(fullPhone: String): Boolean {
        return Regex("^\\+251[79]\\d{8}$").matches(fullPhone)
    }
}

object Formatters {
    fun formatCurrency(amount: Double): String {
        val formatter = NumberFormat.getNumberInstance(Locale.US)
        formatter.minimumFractionDigits = 0
        formatter.maximumFractionDigits = 2
        return "${formatter.format(amount)} ETB"
    }
}

class ShakeController {
    val shakeTrigger = mutableStateOf(0)
    fun shake() {
        shakeTrigger.value += 1
    }
}

@Composable
fun rememberShakeController(): ShakeController {
    return remember { ShakeController() }
}

@Composable
fun Modifier.shake(controller: ShakeController): Modifier {
    val trigger = controller.shakeTrigger.value
    if (trigger == 0) return this

    val translationX = remember(trigger) { Animatable(0f) }
    LaunchedEffect(trigger) {
        val speed = 50
        val times = 4
        val range = 15f
        for (i in 0 until times) {
            val target = if (i % 2 == 0) range else -range
            translationX.animateTo(target, animationSpec = tween(speed, easing = FastOutLinearInEasing))
        }
        translationX.animateTo(0f, animationSpec = tween(speed, easing = FastOutLinearInEasing))
    }
    return this.graphicsLayer {
        this.translationX = translationX.value
    }
}

@Composable
fun Modifier.pulse(enabled: Boolean = true): Modifier {
    if (!enabled) return this
    val infiniteTransition = rememberInfiniteTransition(label = "pulse_transition")
    val scale by infiniteTransition.animateFloat(
        initialValue = 1.0f,
        targetValue = 1.05f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse_scale"
    )
    return this.graphicsLayer {
        scaleX = scale
        scaleY = scale
    }
}

@Composable
fun Modifier.interactiveButton(
    interactionSource: MutableInteractionSource
): Modifier {
    val isPressed by interactionSource.collectIsPressedAsState()
    val isHovered by interactionSource.collectIsHoveredAsState()
    
    val targetScale = when {
        isPressed -> 0.95f
        isHovered -> 1.03f
        else -> 1.0f
    }
    
    val animatedScale by animateFloatAsState(
        targetValue = targetScale,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ),
        label = "interactive_button_scale"
    )
    
    return this.graphicsLayer {
        scaleX = animatedScale
        scaleY = animatedScale
    }
}

@Composable
fun Modifier.liftOnInteraction(
    interactionSource: MutableInteractionSource = remember { MutableInteractionSource() }
): Modifier {
    val isPressed by interactionSource.collectIsPressedAsState()
    val isHovered by interactionSource.collectIsHoveredAsState()
    val isInteracted = isPressed || isHovered
    
    val animatedOffset by animateDpAsState(
        targetValue = if (isInteracted) (-4).dp else 0.dp,
        animationSpec = spring(dampingRatio = Spring.DampingRatioLowBouncy),
        label = "lift_offset"
    )
    
    val animatedShadowElevation by animateDpAsState(
        targetValue = if (isInteracted) 8.dp else 2.dp,
        animationSpec = spring(),
        label = "lift_shadow"
    )
    
    val animatedGlowAlpha by animateFloatAsState(
        targetValue = if (isInteracted) 0.4f else 0.0f,
        animationSpec = tween(150),
        label = "glow_alpha"
    )
    
    return this
        .offset(y = animatedOffset)
        .shadow(
            elevation = animatedShadowElevation,
            shape = RoundedCornerShape(12.dp),
            ambientColor = TelegramBlue.copy(alpha = animatedGlowAlpha),
            spotColor = TelegramBlue.copy(alpha = animatedGlowAlpha)
        )
}

@Composable
fun Modifier.shimmeringGlossNavy(): Modifier {
    val infiniteTransition = rememberInfiniteTransition(label = "shimmer_transition")
    val progress by infiniteTransition.animateFloat(
        initialValue = -0.5f,
        targetValue = 1.5f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 8000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "shimmer_progress"
    )

    val gradientBrush = Brush.linearGradient(
        colors = listOf(
            Color(0xFF16115A),
            Color(0xFF09062A)
        )
    )

    return this.drawBehind {
        drawRect(brush = gradientBrush)

        val width = size.width
        val height = size.height
        val shimmerWidth = width * 0.4f
        val xPosition = progress * width

        val shimmerBrush = Brush.linearGradient(
            colors = listOf(
                Color.Transparent,
                Color.White.copy(alpha = 0.03f),
                Color.White.copy(alpha = 0.05f),
                Color.White.copy(alpha = 0.03f),
                Color.Transparent
            ),
            start = androidx.compose.ui.geometry.Offset(xPosition, 0f),
            end = androidx.compose.ui.geometry.Offset(xPosition + shimmerWidth, height)
        )

        drawRect(brush = shimmerBrush)
    }
}

@Composable
fun Modifier.tactileScale(
    interactionSource: MutableInteractionSource = remember { MutableInteractionSource() }
): Modifier {
    val isPressed by interactionSource.collectIsPressedAsState()
    val animatedScale by animateFloatAsState(
        targetValue = if (isPressed) 0.98f else 1.0f,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioNoBouncy,
            stiffness = Spring.StiffnessMedium
        ),
        label = "tactile_scale"
    )
    return this.graphicsLayer {
        scaleX = animatedScale
        scaleY = animatedScale
    }
}

@Composable
fun ScrollEntranceTransition(
    index: Int = 0,
    content: @Composable () -> Unit
) {
    var animTriggered by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        delay(index * 60L)
        animTriggered = true
    }
    val animatedProgress by animateFloatAsState(
        targetValue = if (animTriggered) 1f else 0f,
        animationSpec = tween(durationMillis = 400, easing = LinearOutSlowInEasing),
        label = "entrance_progress"
    )
    Box(
        modifier = Modifier.graphicsLayer {
            alpha = animatedProgress
            translationY = (1f - animatedProgress) * 30.dp.toPx()
        }
    ) {
        content()
    }
}

// ==========================================
// 4. VERIFIED NATIVE VECTOR LOGO DRAWINGS
// ==========================================
@Composable
fun GoogleLogoIcon(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val sizeVal = size.minDimension
        val strokeWidth = sizeVal * 0.18f
        val radius = (sizeVal - strokeWidth) / 2f
        
        drawArc(
            color = BrandPrimary,
            startAngle = 180f,
            sweepAngle = 140f,
            useCenter = false,
            style = Stroke(width = strokeWidth)
        )
        drawArc(
            color = BrandPrimary,
            startAngle = 320f,
            sweepAngle = 60f,
            useCenter = false,
            style = Stroke(width = strokeWidth)
        )
        drawArc(
            color = BrandPrimary,
            startAngle = 0f,
            sweepAngle = 135f,
            useCenter = false,
            style = Stroke(width = strokeWidth)
        )
        drawArc(
            color = BrandPrimary,
            startAngle = 135f,
            sweepAngle = 45f,
            useCenter = false,
            style = Stroke(width = strokeWidth)
        )
        val barY = center.y
        val barStartX = center.x
        val barEndX = center.x + radius + strokeWidth / 2f
        drawLine(
            color = BrandPrimary,
            start = androidx.compose.ui.geometry.Offset(barStartX, barY),
            end = androidx.compose.ui.geometry.Offset(barEndX, barY),
            strokeWidth = strokeWidth
        )
    }
}

@Composable
fun InfluenceHubLogoSymbol(
    modifier: Modifier = Modifier
) {
    Image(
        painter = painterResource(id = R.drawable.app_logo),
        contentDescription = "Influence Hub Logo",
        modifier = modifier
    )
}

@Composable
fun InfluenceHubBrandText(
    fontSize: androidx.compose.ui.unit.TextUnit,
    isDarkBackground: Boolean,
    modifier: Modifier = Modifier
) {
    val textColor = if (isDarkBackground) Color.White else BrandPrimary
    val accentColor = BrandTertiary

    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "I",
            fontWeight = FontWeight.ExtraBold,
            fontSize = fontSize,
            color = accentColor,
            lineHeight = fontSize
        )
        Text(
            text = "nfluencer ",
            fontWeight = FontWeight.Bold,
            fontSize = fontSize,
            color = textColor,
            lineHeight = fontSize
        )
        Text(
            text = "H",
            fontWeight = FontWeight.ExtraBold,
            fontSize = fontSize,
            color = accentColor,
            lineHeight = fontSize
        )
        Text(
            text = "ub",
            fontWeight = FontWeight.Bold,
            fontSize = fontSize,
            color = textColor,
            lineHeight = fontSize
        )
    }
}

@Composable
fun InfluenceHubFullLogo(
    modifier: Modifier = Modifier,
    isDarkBackground: Boolean = true,
    showSlogan: Boolean = true,
    symbolSize: androidx.compose.ui.unit.Dp = 72.dp
) {
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically
    ) {
        InfluenceHubLogoSymbol(
            modifier = Modifier.size(symbolSize)
        )
        Spacer(modifier = Modifier.width(12.dp))
        Column(verticalArrangement = Arrangement.Center) {
            InfluenceHubBrandText(
                fontSize = (symbolSize.value * 0.32f).sp,
                isDarkBackground = isDarkBackground
            )
            if (showSlogan) {
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "Connect. Collaborate. Grow.",
                    fontWeight = FontWeight.Medium,
                    fontSize = (symbolSize.value * 0.16f).sp,
                    color = if (isDarkBackground) TelegramBlue else Color(0xFF5F5C8C),
                    letterSpacing = 0.5.sp
                )
            }
        }
    }
}

enum class AuthMode {
    LOGIN, SIGNUP
}

// ==========================================
// 5. CORE LOGIN SCREEN
// ==========================================
@Composable
fun LoginScreen(onLoginSuccess: (String) -> Unit) {
    val context = LocalContext.current
    
    var emailInput by remember { mutableStateOf("") }
    var passwordInput by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var validationError by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val shakeController = rememberShakeController()

    val NavyBlue = BrandPrimary
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(NavyBlue)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // 1. TOP HEADER SECTION
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(0.40f)
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(
                                BrandPrimary,
                                BrandSecondary
                            )
                        )
                    )
                    .statusBarsPadding(),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    InfluenceHubLogoSymbol(modifier = Modifier.size(100.dp))
                    Spacer(modifier = Modifier.height(16.dp))
                    InfluenceHubBrandText(fontSize = 32.sp, isDarkBackground = true)
                    Text(
                        text = "Connect. Collaborate. Grow.",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.White.copy(alpha = 0.7f),
                        letterSpacing = 1.sp
                    )
                }
            }

            // 2. FORM CONTAINER SHEET
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(0.60f)
                    .clip(RoundedCornerShape(topStart = 40.dp, topEnd = 40.dp)),
                color = CreamBackground,
                tonalElevation = 8.dp
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 32.dp)
                        .verticalScroll(rememberScrollState())
                        .imePadding(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Spacer(modifier = Modifier.height(40.dp))

                    Text(
                        text = "Welcome Back",
                        fontWeight = FontWeight.Bold,
                        color = BrandPrimary,
                        fontSize = 24.sp
                    )
                    Text(
                        text = "Login to your account",
                        color = BrandPrimary.copy(alpha = 0.6f),
                        fontSize = 14.sp
                    )

                    Spacer(modifier = Modifier.height(32.dp))

                    // EMAIL FIELD
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = "Email",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = BrandPrimary.copy(alpha = 0.8f)
                        )
                        TextField(
                            value = emailInput,
                            onValueChange = { emailInput = it; validationError = "" },
                            placeholder = { Text("Enter your email", color = BrandPrimary.copy(alpha = 0.4f)) },
                            modifier = Modifier.fillMaxWidth(),
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = Color.Transparent,
                                unfocusedContainerColor = Color.Transparent,
                                focusedIndicatorColor = BrandPrimary,
                                unfocusedIndicatorColor = BrandPrimary.copy(alpha = 0.2f),
                                focusedTextColor = BrandPrimary,
                                unfocusedTextColor = BrandPrimary
                            ),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // PASSWORD FIELD
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = "Password",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = BrandPrimary.copy(alpha = 0.8f)
                        )
                        TextField(
                            value = passwordInput,
                            onValueChange = { passwordInput = it; validationError = "" },
                            placeholder = { Text("Enter password", color = BrandPrimary.copy(alpha = 0.4f)) },
                            modifier = Modifier.fillMaxWidth(),
                            visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                            trailingIcon = {
                                IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                    Icon(
                                        imageVector = if (passwordVisible) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                                        contentDescription = null,
                                        tint = BrandPrimary.copy(alpha = 0.6f)
                                    )
                                }
                            },
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = Color.Transparent,
                                unfocusedContainerColor = Color.Transparent,
                                focusedIndicatorColor = BrandPrimary,
                                unfocusedIndicatorColor = BrandPrimary.copy(alpha = 0.2f),
                                focusedTextColor = BrandPrimary,
                                unfocusedTextColor = BrandPrimary
                            ),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
                        )
                    }

                    Text(
                        text = "Forgot password?",
                        modifier = Modifier
                            .align(Alignment.End)
                            .padding(top = 12.dp)
                            .clickable { },
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = BrandPrimary.copy(alpha = 0.7f)
                    )

                    if (validationError.isNotEmpty()) {
                        Text(
                            text = validationError,
                            color = Color.Red,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(top = 16.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(32.dp))

                    // CTA BUTTON
                    val interactionSource = remember { MutableInteractionSource() }
                    Button(
                        onClick = {
                            if (emailInput.isEmpty() || !emailInput.contains("@")) {
                                validationError = "Please enter a valid email."
                            } else if (passwordInput.length < 6) {
                                validationError = "Password must be at least 6 characters."
                            } else {
                                scope.launch {
                                    isLoading = true
                                    delay(1000)
                                    isLoading = false
                                    SecureSessionManager.saveSession(context, emailInput, true)
                                    onLoginSuccess(emailInput)
                                }
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp)
                            .interactiveButton(interactionSource),
                        shape = RoundedCornerShape(28.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = BrandTertiary,
                            contentColor = BrandPrimary
                        ),
                        interactionSource = interactionSource,
                        enabled = !isLoading
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(color = BrandPrimary, modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
                        } else {
                            Text(
                                text = "LOGIN",
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.5.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // GOOGLE LOGIN
                    OutlinedButton(
                        onClick = { /* Handle Google Login */ },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        shape = RoundedCornerShape(28.dp),
                        border = BorderStroke(1.dp, BrandPrimary.copy(alpha = 0.2f)),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = BrandPrimary)
                    ) {
                        GoogleLogoIcon(modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "Continue with Google",
                            fontWeight = FontWeight.Medium,
                            fontSize = 16.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(32.dp))
                }
            }
        }
    }
}


@Preview(showBackground = true)
@Composable
fun LoginScreenPreview() {
    MyApplicationTheme {
        LoginScreen(onLoginSuccess = {})
    }
}

// ==========================================
// 6. MAIN ACTIVITY (ENTRY POINT)
// ==========================================
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                val context = LocalContext.current
                var currentScreen by remember { mutableStateOf(AppScreen.SPLASH) }
                var loggedInPhone by remember { mutableStateOf("") }
                var hasValidSession by remember { mutableStateOf(false) }

                LaunchedEffect(Unit) {
                    if (SecureSessionManager.isSessionValid(context)) {
                        val savedEmail = SecureSessionManager.getSessionEmail(context)
                        if (!savedEmail.isNullOrEmpty()) {
                            loggedInPhone = savedEmail
                            hasValidSession = true
                        }
                    }
                }

                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AnimatedContent(
                        targetState = currentScreen,
                        transitionSpec = {
                            fadeIn() togetherWith fadeOut()
                        },
                        label = "MainScreenTransition"
                    ) { screen ->
                        when (screen) {
                            AppScreen.SPLASH -> SplashScreen(
                                onSplashFinished = {
                                    currentScreen = if (hasValidSession) {
                                        AppScreen.DASHBOARD
                                    } else {
                                        AppScreen.LOGIN
                                    }
                                }
                            )
                            AppScreen.LOGIN -> LoginScreen(
                                onLoginSuccess = { phone ->
                                    loggedInPhone = phone
                                    currentScreen = AppScreen.DASHBOARD
                                }
                            )
                            AppScreen.DASHBOARD -> DashboardShell(
                                loggedInPhone = loggedInPhone,
                                onLogout = {
                                    SecureSessionManager.clearSession(context)
                                    loggedInPhone = ""
                                    currentScreen = AppScreen.LOGIN
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}
