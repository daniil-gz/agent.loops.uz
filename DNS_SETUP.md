# DNS Security Configuration

To fix the "Missing DMARC" and "Missing SPF" errors in your SEO/Security audit, you need to add the following TXT records to your domain's DNS settings (where you bought the domain, e.g., GoDaddy, Namecheap, Reg.ru).

These changes **cannot** be made in the code; they must be done in your domain registrar's control panel.

## 1. SPF Record (Sender Policy Framework)
This tells email providers that your server is allowed to send emails on behalf of your domain.

*   **Type:** `TXT`
*   **Host/Name:** `@` (or leave blank)
*   **Value:**
    ```
    v=spf1 mx a -all
    ```

## 2. DMARC Record
This sets a policy for how to handle emails that fail SPF/DKIM checks. We start with `p=none` (monitoring mode) to avoid blocking legitimate emails while you test.

*   **Type:** `TXT`
*   **Host/Name:** `_dmarc`
*   **Value:**
    ```
    v=DMARC1; p=none; rua=mailto:admin@agent.loops.uz
    ```
    *(Replace `admin@agent.loops.uz` with your actual email address)*
