package com.example

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(onSplashFinished: () -> Unit) {
    // 1. ANIMATION & TIMING LOGIC
    val infiniteTransition = rememberInfiniteTransition(label = "splash_logo_rotation")
    val rotationAngle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "logo_angle"
    )

    LaunchedEffect(Unit) {
        delay(3000L) // 3 seconds delay
        onSplashFinished()
    }

    // 2. SPLASH SCREEN LAYOUT SPECIFICATIONS
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF110D59)) // Solid Dark Navy Blue
            .windowInsetsPadding(WindowInsets.safeDrawing),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Animated rotating logo symbol
            Box(
                modifier = Modifier
                    .size(120.dp)
                    .rotate(rotationAngle)
            ) {
                InfluenceHubLogoSymbol(modifier = Modifier.fillMaxSize())
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // App Name Branding
            InfluenceHubBrandText(
                fontSize = 28.sp,
                isDarkBackground = true
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "Connect. Collaborate. Grow.",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFFEB209),
                letterSpacing = 1.5.sp,
                textAlign = TextAlign.Center
            )
        }
    }
}
