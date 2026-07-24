package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Density
import androidx.compose.runtime.CompositionLocalProvider

import androidx.compose.ui.graphics.Color

private val DarkColorScheme =
  darkColorScheme(
    primary = TelegramBlue,
    secondary = SoftBlueTint,
    tertiary = MidnightIndigo,
    background = DarkBackground,
    surface = SurfaceDark,
    onPrimary = Color.White,
    onSecondary = MidnightIndigo,
    onTertiary = Color.White,
    onBackground = OnSurfaceDark,
    onSurface = OnSurfaceDark
  )

private val LightColorScheme =
  lightColorScheme(
    primary = MidnightIndigo,
    secondary = TelegramBlue,
    tertiary = SoftBlueTint,
    background = LightBackground,
    surface = SurfaceLight,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onTertiary = MidnightIndigo,
    onBackground = OnSurfaceLight,
    onSurface = OnSurfaceLight
  )

@Composable
fun MyApplicationTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  // Dynamic color is available on Android 12+
  dynamicColor: Boolean = false, // Disabled dynamic color to strictly follow brand guidelines
  content: @Composable () -> Unit,
) {
  val colorScheme =
    when {
      dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
        val context = LocalContext.current
        if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
      }

      darkTheme -> DarkColorScheme
      else -> LightColorScheme
    }

  val currentDensity = LocalDensity.current
  val customDensity = Density(
    density = currentDensity.density,
    fontScale = 1.0f
  )

  CompositionLocalProvider(LocalDensity provides customDensity) {
    MaterialTheme(colorScheme = colorScheme, typography = Typography, content = content)
  }
}
