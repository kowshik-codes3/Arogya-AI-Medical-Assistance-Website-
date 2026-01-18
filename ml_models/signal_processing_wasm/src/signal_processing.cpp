/*
 * High-Performance rPPG Signal Processing in C++
 * Compiled to WebAssembly for browser use
 * 
 * This module implements:
 * 1. Band-pass filtering for heart rate isolation
 * 2. FFT-based frequency domain analysis
 * 3. Peak detection for vital sign calculation
 * 4. Noise reduction and signal smoothing
 */

#include <cmath>
#include <vector>
#include <algorithm>
#include <complex>

// Export functions for WebAssembly
extern "C" {
    
// Memory management
void* malloc(size_t size);
void free(void* ptr);

// Main signal processing functions
int process_rppg_signals(float* input, float* output, int length, float sample_rate);
float calculate_heart_rate_fft(float* signals, int length, float sample_rate, float min_bpm, float max_bpm);
float calculate_respiration_rate(float* signals, int length, float sample_rate, float min_brpm, float max_brpm);
int bandpass_filter(float* input, float* output, int length, float sample_rate, float low_cutoff, float high_cutoff);

}

// Constants
const float PI = 3.14159265359f;

/**
 * Detrend signal by removing DC component and linear trends
 */
void detrend_signal(float* signal, int length) {
    // Remove DC component (mean)
    float mean = 0.0f;
    for (int i = 0; i < length; i++) {
        mean += signal[i];
    }
    mean /= length;
    
    for (int i = 0; i < length; i++) {
        signal[i] -= mean;
    }
    
    // Remove linear trend using least squares
    float sum_x = 0, sum_y = 0, sum_xy = 0, sum_x2 = 0;
    for (int i = 0; i < length; i++) {
        sum_x += i;
        sum_y += signal[i];
        sum_xy += i * signal[i];
        sum_x2 += i * i;
    }
    
    float slope = (length * sum_xy - sum_x * sum_y) / (length * sum_x2 - sum_x * sum_x);
    float intercept = (sum_y - slope * sum_x) / length;
    
    for (int i = 0; i < length; i++) {
        signal[i] -= (slope * i + intercept);
    }
}

/**
 * Apply Butterworth band-pass filter
 */
int bandpass_filter(float* input, float* output, int length, float sample_rate, float low_cutoff, float high_cutoff) {
    if (!input || !output || length <= 0) return 0;
    
    // Normalize frequencies
    float nyquist = sample_rate / 2.0f;
    float low_norm = low_cutoff / nyquist;
    float high_norm = high_cutoff / nyquist;
    
    if (low_norm <= 0 || high_norm >= 1 || low_norm >= high_norm) return 0;
    
    // Simple IIR filter implementation (Butterworth approximation)
    float rc_low = 1.0f / (2.0f * PI * low_cutoff);
    float rc_high = 1.0f / (2.0f * PI * high_cutoff);
    float dt = 1.0f / sample_rate;
    
    float alpha_low = dt / (rc_low + dt);
    float alpha_high = rc_high / (rc_high + dt);
    
    // High-pass then low-pass
    std::vector<float> temp(length);
    
    // High-pass filter
    temp[0] = input[0];
    for (int i = 1; i < length; i++) {
        temp[i] = alpha_high * (temp[i-1] + input[i] - input[i-1]);
    }
    
    // Low-pass filter
    output[0] = temp[0];
    for (int i = 1; i < length; i++) {
        output[i] = output[i-1] + alpha_low * (temp[i] - output[i-1]);
    }
    
    return 1;
}

/**
 * Simple FFT implementation (Cooley-Tukey algorithm)
 */
void fft(std::vector<std::complex<float>>& data) {
    int N = data.size();
    if (N <= 1) return;
    
    // Divide
    std::vector<std::complex<float>> even, odd;
    for (int i = 0; i < N; i++) {
        if (i % 2 == 0) even.push_back(data[i]);
        else odd.push_back(data[i]);
    }
    
    // Conquer
    fft(even);
    fft(odd);
    
    // Combine
    for (int k = 0; k < N/2; k++) {
        std::complex<float> t = std::polar(1.0f, -2 * PI * k / N) * odd[k];
        data[k] = even[k] + t;
        data[k + N/2] = even[k] - t;
    }
}

/**
 * Calculate power spectral density
 */
std::vector<float> calculate_psd(float* signal, int length) {
    // Prepare data for FFT (pad to power of 2)
    int fft_size = 1;
    while (fft_size < length) fft_size <<= 1;
    
    std::vector<std::complex<float>> fft_data(fft_size);
    for (int i = 0; i < length; i++) {
        fft_data[i] = std::complex<float>(signal[i], 0);
    }
    for (int i = length; i < fft_size; i++) {
        fft_data[i] = std::complex<float>(0, 0);
    }
    
    // Apply windowing (Hanning window)
    for (int i = 0; i < length; i++) {
        float window = 0.5f * (1.0f - std::cos(2.0f * PI * i / (length - 1)));
        fft_data[i] *= window;
    }
    
    // Compute FFT
    fft(fft_data);
    
    // Calculate power spectral density
    std::vector<float> psd(fft_size / 2);
    for (int i = 0; i < fft_size / 2; i++) {
        psd[i] = std::norm(fft_data[i]);
    }
    
    return psd;
}

/**
 * Find peak frequency in specified range
 */
float find_peak_frequency(const std::vector<float>& psd, float sample_rate, float min_freq, float max_freq) {
    int fft_size = psd.size() * 2;
    float freq_resolution = sample_rate / fft_size;
    
    int min_bin = static_cast<int>(min_freq / freq_resolution);
    int max_bin = static_cast<int>(max_freq / freq_resolution);
    
    min_bin = std::max(1, min_bin); // Avoid DC component
    max_bin = std::min(static_cast<int>(psd.size()) - 1, max_bin);
    
    int peak_bin = min_bin;
    float max_power = psd[min_bin];
    
    for (int i = min_bin + 1; i <= max_bin; i++) {
        if (psd[i] > max_power) {
            max_power = psd[i];
            peak_bin = i;
        }
    }
    
    return peak_bin * freq_resolution;
}

/**
 * Main signal processing pipeline
 */
int process_rppg_signals(float* input, float* output, int length, float sample_rate) {
    if (!input || !output || length <= 0) return 0;
    
    // Copy input to output for processing
    for (int i = 0; i < length; i++) {
        output[i] = input[i];
    }
    
    // Step 1: Detrend signal
    detrend_signal(output, length);
    
    // Step 2: Apply band-pass filter for heart rate range (0.8-3.0 Hz = 48-180 BPM)
    std::vector<float> temp(length);
    for (int i = 0; i < length; i++) temp[i] = output[i];
    
    if (!bandpass_filter(temp.data(), output, length, sample_rate, 0.8f, 3.0f)) {
        return 0;
    }
    
    // Step 3: Normalize signal
    float max_val = *std::max_element(output, output + length);
    float min_val = *std::min_element(output, output + length);
    float range = max_val - min_val;
    
    if (range > 0) {
        for (int i = 0; i < length; i++) {
            output[i] = (output[i] - min_val) / range;
        }
    }
    
    return 1;
}

/**
 * Calculate heart rate using FFT
 */
float calculate_heart_rate_fft(float* signals, int length, float sample_rate, float min_bpm, float max_bpm) {
    if (!signals || length <= 0) return 0.0f;
    
    // Convert BPM to Hz
    float min_hz = min_bpm / 60.0f;
    float max_hz = max_bpm / 60.0f;
    
    // Calculate power spectral density
    std::vector<float> psd = calculate_psd(signals, length);
    
    // Find peak frequency in heart rate range
    float peak_freq = find_peak_frequency(psd, sample_rate, min_hz, max_hz);
    
    // Convert back to BPM
    return peak_freq * 60.0f;
}

/**
 * Calculate respiration rate
 */
float calculate_respiration_rate(float* signals, int length, float sample_rate, float min_brpm, float max_brpm) {
    if (!signals || length <= 0) return 0.0f;
    
    // Apply low-pass filter for respiration range (0.1-0.7 Hz = 6-42 BrPM)
    std::vector<float> filtered(length);
    if (!bandpass_filter(signals, filtered.data(), length, sample_rate, 0.1f, 0.7f)) {
        return 0.0f;
    }
    
    // Convert BrPM to Hz
    float min_hz = min_brpm / 60.0f;
    float max_hz = max_brpm / 60.0f;
    
    // Calculate PSD
    std::vector<float> psd = calculate_psd(filtered.data(), length);
    
    // Find peak frequency
    float peak_freq = find_peak_frequency(psd, sample_rate, min_hz, max_hz);
    
    // Convert to BrPM
    return peak_freq * 60.0f;
}