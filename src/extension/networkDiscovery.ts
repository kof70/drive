/**
 * Network Discovery for VS Code Extension
 * 
 * Provides utilities for detecting local network IP addresses
 * and generating QR codes for easy mobile device access.
 * 
 * Requirements: 4.1, 4.3
 */

import * as os from 'os';
import * as QRCode from 'qrcode';

/**
 * Network interface information
 */
export interface NetworkInterface {
  name: string;
  address: string;
  family: 'IPv4' | 'IPv6';
  internal: boolean;
}

/**
 * Network Discovery service
 * Detects local network IP addresses and generates QR codes for URLs
 */
export class NetworkDiscovery {
  /**
   * Get all local IPv4 addresses (excluding loopback/internal)
   * @returns Array of IPv4 addresses available on the local network
   */
  getLocalIPs(): string[] {
    const ips: string[] = [];
    const interfaces = os.networkInterfaces();

    for (const name of Object.keys(interfaces)) {
      const netInterface = interfaces[name];
      if (!netInterface) continue;

      for (const net of netInterface) {
        // Skip internal (loopback) addresses
        if (net.internal) continue;
        
        // Only include IPv4 addresses
        if (net.family !== 'IPv4') continue;
        
        // Filter out link-local addresses (169.254.x.x)
        if (net.address.startsWith('169.254.')) continue;
        
        ips.push(net.address);
      }
    }

    return ips;
  }

  /**
   * Get detailed information about all network interfaces
   * @returns Array of NetworkInterface objects
   */
  getNetworkInterfaces(): NetworkInterface[] {
    const result: NetworkInterface[] = [];
    const interfaces = os.networkInterfaces();

    for (const name of Object.keys(interfaces)) {
      const netInterface = interfaces[name];
      if (!netInterface) continue;

      for (const net of netInterface) {
        // Skip internal addresses
        if (net.internal) continue;
        
        // Only include IPv4
        if (net.family !== 'IPv4') continue;
        
        // Filter out link-local addresses
        if (net.address.startsWith('169.254.')) continue;

        result.push({
          name,
          address: net.address,
          family: net.family as 'IPv4' | 'IPv6',
          internal: net.internal,
        });
      }
    }

    return result;
  }

  /**
   * Generate a QR code as a data URL for the given URL
   * @param url The URL to encode in the QR code
   * @returns Promise resolving to a data URL (base64 PNG image)
   */
  async generateQRCode(url: string): Promise<string> {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      });
      return dataUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate QR code: ${message}`);
    }
  }

  /**
   * Generate URLs for all available network interfaces
   * @param port The server port
   * @returns Array of URLs (http://ip:port)
   */
  getNetworkUrls(port: number): string[] {
    return this.getLocalIPs().map(ip => `http://${ip}:${port}`);
  }

  /**
   * Get the primary local IP address (first non-internal IPv4)
   * @returns The primary IP address or null if none found
   */
  getPrimaryIP(): string | null {
    const ips = this.getLocalIPs();
    return ips.length > 0 ? ips[0] : null;
  }
}

// Export singleton instance for convenience
export const networkDiscovery = new NetworkDiscovery();
