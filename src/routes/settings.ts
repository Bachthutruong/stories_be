import express from 'express';
import { auth, adminAuth } from '../middleware/auth';

const router = express.Router();

// In-memory settings storage (in production, use database)
let siteSettings = {
  postCreationConfirmation: {
    title: '夢想卡上傳成功',
    message: '感謝您分享您的夢想！您的夢想卡已成功上傳並等待審核。',
    buttonText: '確定'
  },
  termsAndConditions: {
    title: '使用條款與隱私政策',
    content: `在使用本平台服務前，請仔細閱讀以下條款：

1. 內容規範
   • 分享適當且尊重的內容
   • 不侵犯任何版權或智慧財產權
   • 不發布垃圾訊息、誤導性或有害內容
   • 尊重他人隱私和權利
   • 允許我們審核和審查您的內容

2. 用戶責任
   • 確保發布內容的真實性和適當性
   • 遵守當地法律法規
   • 不進行任何形式的騷擾或欺凌
   • 保護個人隱私信息

3. 平台權利
   • 我們有權移除違反社區準則的內容
   • 保留暫停或終止違規用戶帳戶的權利
   • 有權修改這些條款，恕不另行通知

4. 隱私保護
   • 我們承諾保護您的個人信息
   • 不會向第三方出售您的個人資料
   • 僅在必要時使用您的信息

5. 免責聲明
   • 用戶對其發布的內容承擔全部責任
   • 平台不對用戶內容造成的任何損失負責

通過使用本平台，您同意遵守上述所有條款。`
  },
  contactInfo: {
    email: 'contact@example.com',
    phone: '+886 912 345 678',
    address: '台北市信義區信義路五段7號'
  },
  siteInfo: {
    name: '希望夢想牆',
    description: '分享您的夢想，讓世界看見希望',
    footerText: '© 2025 希望夢想牆. All rights reserved.'
  }
};

// Get settings (public)
router.get('/', async (req, res) => {
  try {
    res.json(siteSettings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get settings (admin only)
router.get('/admin', adminAuth, async (req, res) => {
  try {
    res.json(siteSettings);
  } catch (error) {
    console.error('Get admin settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update settings (admin only)
router.put('/admin', adminAuth, async (req, res) => {
  try {
    const { postCreationConfirmation, termsAndConditions, contactInfo, siteInfo } = req.body;
    
    // Validate required fields
    if (!postCreationConfirmation?.title || !postCreationConfirmation?.message || !postCreationConfirmation?.buttonText) {
      return res.status(400).json({ message: 'Post creation confirmation settings are required' });
    }
    
    if (!termsAndConditions?.title || !termsAndConditions?.content) {
      return res.status(400).json({ message: 'Terms and conditions settings are required' });
    }
    
    if (!contactInfo?.email) {
      return res.status(400).json({ message: 'Contact email is required' });
    }
    
    if (!siteInfo?.name || !siteInfo?.description) {
      return res.status(400).json({ message: 'Site name and description are required' });
    }
    
    // Update settings
    siteSettings = {
      postCreationConfirmation,
      termsAndConditions,
      contactInfo,
      siteInfo
    };
    
    res.json({
      message: 'Settings updated successfully',
      settings: siteSettings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 