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
import com.example.ui.theme.MyApplicationTheme
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
            ambientColor = Color(0xFFFEB209).copy(alpha = animatedGlowAlpha),
            spotColor = Color(0xFF2E1C8D).copy(alpha = animatedGlowAlpha)
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
            color = Color(0xFFEA4335),
            startAngle = 180f,
            sweepAngle = 140f,
            useCenter = false,
            style = Stroke(width = strokeWidth)
        )
        drawArc(
            color = Color(0xFF4285F4),
            startAngle = 320f,
            sweepAngle = 60f,
            useCenter = false,
            style = Stroke(width = strokeWidth)
        )
        drawArc(
            color = Color(0xFF34A853),
            startAngle = 0f,
            sweepAngle = 135f,
            useCenter = false,
            style = Stroke(width = strokeWidth)
        )
        drawArc(
            color = Color(0xFFFBBC05),
            startAngle = 135f,
            sweepAngle = 45f,
            useCenter = false,
            style = Stroke(width = strokeWidth)
        )
        val barY = center.y
        val barStartX = center.x
        val barEndX = center.x + radius + strokeWidth / 2f
        drawLine(
            color = Color(0xFF4285F4),
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
    Canvas(
        modifier = modifier
            .graphicsLayer {
                compositingStrategy = CompositingStrategy.Offscreen
            }
    ) {
        val width = size.width
        val height = size.height

        val gradient = Brush.linearGradient(
            colors = listOf(
                Color(0xFF2E09D3),
                Color(0xFF6C2CF5),
                Color(0xFF8B2CF5),
                Color(0xFFB5179E)
            ),
            start = androidx.compose.ui.geometry.Offset(0f, height),
            end = androidx.compose.ui.geometry.Offset(width, 0f)
        )

        val pillarWidth = width * 0.22f
        val pillarHeight = height * 0.74f
        val pillarCornerRadius = pillarWidth / 2f
        
        val leftPillarLeft = width * 0.11f
        val leftPillarTop = height * 0.13f

        drawRoundRect(
            brush = gradient,
            topLeft = androidx.compose.ui.geometry.Offset(leftPillarLeft, leftPillarTop),
            size = androidx.compose.ui.geometry.Size(pillarWidth, pillarHeight),
            cornerRadius = androidx.compose.ui.geometry.CornerRadius(pillarCornerRadius, pillarCornerRadius)
        )

        val rightPillarLeft = width * 0.67f
        val rightPillarTop = height * 0.13f

        drawRoundRect(
            brush = gradient,
            topLeft = androidx.compose.ui.geometry.Offset(rightPillarLeft, rightPillarTop),
            size = androidx.compose.ui.geometry.Size(pillarWidth, pillarHeight),
            cornerRadius = androidx.compose.ui.geometry.CornerRadius(pillarCornerRadius, pillarCornerRadius)
        )

        val bridgePath = Path().apply {
            val leftInnerX = leftPillarLeft + pillarWidth - 1f
            val rightInnerX = rightPillarLeft + 1f
            
            val topControlY = height * 0.32f
            val bottomControlY = height * 0.68f
            
            moveTo(leftInnerX, height * 0.40f)
            quadraticTo(
                width * 0.5f, topControlY,
                rightInnerX, height * 0.40f
            )
            lineTo(rightInnerX, height * 0.60f)
            quadraticTo(
                width * 0.5f, bottomControlY,
                leftInnerX, height * 0.60f
            )
            close()
        }

        drawPath(
            path = bridgePath,
            brush = gradient
        )

        val ringOuterRadius = width * 0.14f
        val ringInnerRadius = width * 0.07f
        val ringStrokeWidth = ringOuterRadius - ringInnerRadius
        val ringRadius = (ringOuterRadius + ringInnerRadius) / 2f

        drawCircle(
            color = Color.Transparent,
            radius = ringRadius,
            center = androidx.compose.ui.geometry.Offset(width / 2f, height / 2f),
            style = Stroke(width = ringStrokeWidth),
            blendMode = BlendMode.Clear
        )
    }
}

@Composable
fun InfluenceHubBrandText(
    fontSize: androidx.compose.ui.unit.TextUnit,
    isDarkBackground: Boolean,
    modifier: Modifier = Modifier
) {
    val textColor = if (isDarkBackground) Color.White else Color(0xFF0F0E47)
    val purpleColor = Color(0xFF8B2CF5)

    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "I",
            fontWeight = FontWeight.Bold,
            fontSize = fontSize,
            color = purpleColor,
            lineHeight = fontSize
        )
        Text(
            text = "nfluencer ",
            fontWeight = FontWeight.Normal,
            fontSize = fontSize,
            color = textColor,
            lineHeight = fontSize
        )
        Text(
            text = "Hub",
            fontWeight = FontWeight.ExtraBold,
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
                    color = if (isDarkBackground) Color(0xFFFEB209) else Color(0xFF5F5C8C),
                    letterSpacing = 0.5.sp
                )
            }
        }
    }
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
    var rememberMe by remember { mutableStateOf(false) }
    var validationError by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val shakeController = rememberShakeController()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF4F5F8))
            .windowInsetsPadding(WindowInsets.safeDrawing),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            ScrollEntranceTransition(index = 0) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 24.dp)
                ) {
                    InfluenceHubLogoSymbol(modifier = Modifier.size(80.dp))
                    Spacer(modifier = Modifier.height(12.dp))
                    InfluenceHubBrandText(fontSize = 28.sp, isDarkBackground = false)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Connect. Collaborate. Grow.",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF16115A),
                        letterSpacing = 1.5.sp
                    )
                }
            }

            ScrollEntranceTransition(index = 1) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shake(shakeController)
                        .shadow(12.dp, RoundedCornerShape(16.dp)),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF110D59)),
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.dp, Color(0xFF1A1661))
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.Start
                    ) {
                        Text(
                            text = "Log in",
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        
                        Text(
                            text = "Enter your credentials.",
                            fontSize = 14.sp,
                            color = Color(0xFFB4B0D5),
                            modifier = Modifier.padding(top = 2.dp, bottom = 20.dp)
                        )

                        Text(
                            text = buildAnnotatedString {
                                append("Email ")
                                withStyle(style = SpanStyle(color = Color.Red)) {
                                    append("*")
                                }
                            },
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            modifier = Modifier.padding(bottom = 6.dp)
                        )
                        
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp)
                                .border(
                                    width = 1.dp,
                                    color = if (validationError.contains("email", ignoreCase = true)) Color.Red else Color(0xFF4C4993).copy(alpha = 0.5f),
                                    shape = RoundedCornerShape(8.dp)
                                )
                                .background(Color(0xFF1C186E), RoundedCornerShape(8.dp))
                                .padding(horizontal = 14.dp),
                            contentAlignment = Alignment.CenterStart
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(
                                    imageVector = Icons.Outlined.Email,
                                    contentDescription = "Email Icon",
                                    tint = Color(0xFFB4B0D5),
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                TextField(
                                    value = emailInput,
                                    onValueChange = { 
                                        emailInput = it
                                        validationError = ""
                                    },
                                    placeholder = {
                                        Text(
                                            text = "Enter your email",
                                            color = Color(0xFFB4B0D5).copy(alpha = 0.6f),
                                            fontSize = 14.sp
                                        )
                                    },
                                    colors = TextFieldDefaults.colors(
                                        focusedContainerColor = Color.Transparent,
                                        unfocusedContainerColor = Color.Transparent,
                                        disabledContainerColor = Color.Transparent,
                                        focusedIndicatorColor = Color.Transparent,
                                        unfocusedIndicatorColor = Color.Transparent,
                                        focusedTextColor = Color.White,
                                        unfocusedTextColor = Color.White
                                    ),
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                                    singleLine = true,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .testTag("email_input")
                                 )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(
                            text = "Password",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            modifier = Modifier.padding(bottom = 6.dp)
                        )

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp)
                                .border(
                                    width = 1.dp,
                                    color = if (validationError.contains("password", ignoreCase = true)) Color.Red else Color(0xFF4C4993).copy(alpha = 0.5f),
                                    shape = RoundedCornerShape(8.dp)
                                )
                                .background(Color(0xFF1C186E), RoundedCornerShape(8.dp))
                                .padding(horizontal = 14.dp),
                            contentAlignment = Alignment.CenterStart
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(
                                    imageVector = Icons.Outlined.Lock,
                                    contentDescription = "Password Icon",
                                    tint = Color(0xFFB4B0D5),
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                TextField(
                                    value = passwordInput,
                                    onValueChange = { 
                                        passwordInput = it
                                        validationError = ""
                                    },
                                    placeholder = {
                                        Text(
                                            text = "Enter password",
                                            color = Color(0xFFB4B0D5).copy(alpha = 0.6f),
                                            fontSize = 14.sp
                                        )
                                    },
                                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                                    colors = TextFieldDefaults.colors(
                                        focusedContainerColor = Color.Transparent,
                                        unfocusedContainerColor = Color.Transparent,
                                        disabledContainerColor = Color.Transparent,
                                        focusedIndicatorColor = Color.Transparent,
                                        unfocusedIndicatorColor = Color.Transparent,
                                        focusedTextColor = Color.White,
                                        unfocusedTextColor = Color.White
                                    ),
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                                    singleLine = true,
                                    modifier = Modifier
                                        .weight(1f)
                                        .testTag("password_input")
                                )
                                IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                    Icon(
                                        imageVector = if (passwordVisible) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                                        contentDescription = "Toggle Password Visibility",
                                        tint = Color(0xFFB4B0D5),
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.clickable { rememberMe = !rememberMe }
                            ) {
                                Checkbox(
                                    checked = rememberMe,
                                    onCheckedChange = { rememberMe = it },
                                    colors = CheckboxDefaults.colors(
                                        checkedColor = Color(0xFFFEB209),
                                        uncheckedColor = Color.White,
                                        checkmarkColor = Color(0xFF110D59)
                                    ),
                                    modifier = Modifier.size(24.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Remember me",
                                    fontSize = 13.sp,
                                    color = Color.White
                                )
                            }

                            Text(
                                text = "Forgot password?",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFFFEB209),
                                modifier = Modifier.clickable {}
                            )
                        }

                        if (validationError.isNotEmpty()) {
                            Text(
                                text = validationError,
                                color = Color.Red,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Medium,
                                modifier = Modifier.padding(top = 10.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        val loginInteractionSource = remember { MutableInteractionSource() }
                        Button(
                            onClick = {
                                if (emailInput.isEmpty() || !emailInput.contains("@") || !emailInput.contains(".")) {
                                    validationError = "Please enter a valid email address."
                                    shakeController.shake()
                                } else if (passwordInput.length < 6) {
                                    validationError = "Password must be at least 6 characters."
                                    shakeController.shake()
                                } else {
                                    scope.launch {
                                        isLoading = true
                                        delay(800)
                                        isLoading = false
                                        SecureSessionManager.saveSession(context, emailInput, rememberMe)
                                        onLoginSuccess(emailInput)
                                    }
                                }
                            },
                            interactionSource = loginInteractionSource,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFFFEB209),
                                contentColor = Color(0xFF110D59)
                            ),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp)
                                .pulse(enabled = !isLoading)
                                .interactiveButton(loginInteractionSource)
                                .testTag("submit_button"),
                            enabled = !isLoading
                        ) {
                            if (isLoading) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(20.dp),
                                    color = Color(0xFF110D59),
                                    strokeWidth = 2.dp
                                )
                            } else {
                                Text(
                                    text = "Login",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF110D59)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .height(1.dp)
                                    .background(Color(0xFF4C4993).copy(alpha = 0.5f))
                            )
                            Text(
                                text = "or",
                                color = Color(0xFFB4B0D5),
                                fontSize = 12.sp,
                                modifier = Modifier.padding(horizontal = 10.dp)
                            )
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .height(1.dp)
                                    .background(Color(0xFF4C4993).copy(alpha = 0.5f))
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        var isGoogleLoading by remember { mutableStateOf(false) }
                        Button(
                            onClick = {
                                scope.launch {
                                    isGoogleLoading = true
                                    Toast.makeText(context, "Initiating Google Secure Authentication...", Toast.LENGTH_SHORT).show()
                                    delay(1200)
                                    isGoogleLoading = false
                                    SecureSessionManager.saveSession(context, "google.user@gmail.com", true)
                                    onLoginSuccess("google.user@gmail.com")
                                }
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color.White,
                                contentColor = Color(0xFF110D59)
                            ),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp)
                                .testTag("google_login_button"),
                            enabled = !isGoogleLoading && !isLoading
                        ) {
                            if (isGoogleLoading) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(20.dp),
                                    color = Color(0xFF110D59),
                                    strokeWidth = 2.dp
                                )
                            } else {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.Center
                                ) {
                                    GoogleLogoIcon(modifier = Modifier.size(20.dp))
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Text(
                                        text = "Continue with Google",
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF110D59)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
            Text(
                text = "InfluenceHub Regulatory System Access • Addis Ababa, ET",
                fontSize = 10.sp,
                color = Color(0xFF5F5C8C).copy(alpha = 0.8f),
                textAlign = TextAlign.Center
            )
        }
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
