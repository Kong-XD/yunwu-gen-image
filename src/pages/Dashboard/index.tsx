import React, { useState } from 'react';
import { Card, Upload, Button, Input, Space, message, Image, Select } from 'antd';
import {
  CloudUploadOutlined,
  DeleteOutlined,
  GlobalOutlined,
  PlayCircleOutlined,
  UploadOutlined,
  KeyOutlined,
  BulbOutlined,
  SettingOutlined,
  PlusOutlined
} from '@ant-design/icons';
// @ts-ignore
import Papa from 'papaparse';
import './index.less';

const { TextArea } = Input;

const Dashboard: React.FC = () => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [promptContent, setPromptContent] = useState('');
  const [validShots, setValidShots] = useState<any[]>([]);
  const [editingScene, setEditingScene] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<any>({});
  const [apiKey, setApiKey] = useState<string>(() => {
    // 从localStorage加载API密钥
    return localStorage.getItem('apiKey') || '';
  });
  const [apiPlatform, setApiPlatform] = useState<string>(() => {
    // 从localStorage加载API平台
    return localStorage.getItem('apiPlatform') || '云雾';
  });
  const [model, setModel] = useState<string>(() => {
    // 从localStorage加载模型
    return localStorage.getItem('model') || 'Sora';
  });
  const [customStyle, setCustomStyle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [generationProgress, setGenerationProgress] = useState<{[key: number]: string}>({});

  // 处理API密钥变化
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    // 保存到localStorage
    localStorage.setItem('apiKey', newApiKey);
  };

  // 处理API平台变化
  const handleApiPlatformChange = (value: string) => {
    setApiPlatform(value);
    // 保存到localStorage
    localStorage.setItem('apiPlatform', value);
  };

  // 处理模型变化
  const handleModelChange = (value: string) => {
    setModel(value);
    // 保存到localStorage
    localStorage.setItem('model', value);
  };

  // 处理自定义风格变化
  const handleCustomStyleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCustomStyle = e.target.value;
    setCustomStyle(newCustomStyle);
  };

  // 解析场景的提示词内容
  const parseScenePrompt = (sceneData: any) => {
    if (!sceneData) return null;
    
    const prompt = sceneData['分镜提示词'] || sceneData['提示词'] || sceneData['内容'] || sceneData['描述'] || '';
    
    // 尝试解析JSON格式的提示词
    try {
      const parsedPrompt = JSON.parse(prompt);
      return parsedPrompt;
    } catch (error) {
      // 如果不是JSON格式，返回原始文本
      return {
        subject: {
          characters: '',
          expression: '',
          action: prompt
        },
        environment: '',
        time: '',
        weather: '',
        perspective: '',
        shotType: ''
      };
    }
  };

  // 开始编辑场景
  const startEditing = (sceneIndex: number) => {
    const sceneData = validShots[sceneIndex];
    const parsedPrompt = parseScenePrompt(sceneData);
    setEditingScene(sceneIndex);
    setEditingContent(parsedPrompt || {});
  };

  // 取消编辑
  const cancelEditing = () => {
    setEditingScene(null);
    setEditingContent({});
  };

  // 保存编辑
  const saveEditing = () => {
    if (editingScene !== null) {
      const updatedShots = [...validShots];
      const promptText = JSON.stringify(editingContent);
      updatedShots[editingScene] = {
        ...updatedShots[editingScene],
        '分镜提示词': promptText,
        '提示词': promptText,
        '内容': promptText,
        '描述': promptText
      };
      setValidShots(updatedShots);
      setEditingScene(null);
      setEditingContent({});
      message.success('场景内容已保存');
    }
  };

  // 更新编辑内容
  const updateEditingContent = (field: string, value: string) => {
    setEditingContent((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // 更新主体内容
  const updateSubjectContent = (field: string, value: string) => {
    setEditingContent((prev: any) => ({
      ...prev,
      subject: {
        ...prev.subject,
        [field]: value
      }
    }));
  };

  // 参考图上传配置
  const uploadProps = {
    name: 'file',
    accept: '.jpg,.jpeg,.png,.gif',
    multiple: true,
    fileList,
    beforeUpload: (file: any) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件!');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('图片大小不能超过 10MB!');
        return false;
      }
      return false; // 阻止自动上传
    },
    onChange: (info: any) => {
      setFileList(info.fileList.slice(-20)); // 最多20张
    },
    onDrop: (e: any) => {
      console.log('Dropped files', e.dataTransfer.files);
    },
    onRemove: (file: any) => {
      const newFileList = fileList.filter(item => item.uid !== file.uid);
      setFileList(newFileList);
    },
  };


  // 删除图片
  const handleRemoveImage = (uid: string) => {
    const newFileList = fileList.filter(item => item.uid !== uid);
    setFileList(newFileList);
  };

  // 将图片文件转换为base64
  const convertImageToBase64 = (file: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // 移除data:image/xxx;base64,前缀，只保留base64数据
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file.originFileObj || file);
    });
  };

  // 调用API生成图片
  const callGenerateAPI = async (prompt: string, base64Images: string[]) => {
    // 构建用户内容数组
    const userContent: any[] = [
      {
        type: "text",
        text: prompt
      }
    ];

    // 为每张图片添加image_url
    base64Images.forEach((base64Image) => {
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${base64Image}`
        }
      });
    });

    const requestBody = {
      model: "sora_image",
      messages: [
        {
          role: "system",
          content: "你是一个AI图像生成助手，根据用户的文字描述和参考图片生成一张高质量的图片。\n\n关键要求：你必须严格按照指定的宽高比生成图片。用户选择的宽高比是 Portrait（2:3）。\n\n这是强制性要求，必须严格遵守。不得生成其他宽高比的图片。\n\n宽高比是最重要的约束条件，必须严格执行。"
        },
        {
          role: "user",
          content: userContent
        }
      ]
    };

    try {
      const response = await fetch('https://yunwu.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API调用失败:', error);
      throw error;
    }
  };

  // 带重试的API调用函数
  const callGenerateAPIWithRetry = async (prompt: string, base64Images: string[], maxRetries: number = 3) => {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`API调用尝试 ${attempt}/${maxRetries}`);
        const result = await callGenerateAPI(prompt, base64Images);
        return result;
      } catch (error) {
        lastError = error;
        console.error(`API调用失败 (尝试 ${attempt}/${maxRetries}):`, error);
        
        if (attempt < maxRetries) {
          // 重试前等待一段时间，使用指数退避
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`等待 ${delay}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  };

  // 根据prompt过滤需要的图片
  const filterImagesByPrompt = (promptText: string, fileList: any[], base64Images: string[]) => {
    const filteredImages: string[] = [];
    console.log('fileList', fileList);
    console.log('base64Images', base64Images);
    console.log('promptText', promptText);
    fileList.forEach((file, index) => {
      const fileName = file.name.split('.')[0];
      // 检查prompt中是否包含图片名称（不区分大小写）
      if (promptText.toLowerCase().includes(fileName.toLowerCase())) {
        filteredImages.push(base64Images[index]);
        console.log(`找到匹配的图片: ${fileName}`);
      }
    });
    
    console.log(`从 ${fileList.length} 张图片中过滤出 ${filteredImages.length} 张相关图片`);
    return filteredImages;
  };

  // 处理单个场景生成
  const generateSingleScene = async (sceneIndex: number, scene: any, fileList: any[], base64Images: string[]) => {
    const parsedPrompt = parseScenePrompt(scene);
    
    // 构建提示词
    let promptText = '';
    if (parsedPrompt && parsedPrompt.subject && parsedPrompt.subject.action) {
      promptText = parsedPrompt.subject.action;
    } else {
      // 如果没有解析到结构化数据，使用原始提示词
      promptText = scene['分镜提示词'] || scene['提示词'] || scene['内容'] || scene['描述'] || '';
    }

    // 添加自定义风格
    if (customStyle.trim()) {
      promptText += `\n\n风格要求：${customStyle}`;
    }

    // 根据prompt过滤需要的图片
    const filteredImages = filterImagesByPrompt(promptText, fileList, base64Images);
    console.log('filteredImages', filteredImages);

    try {
      // 更新进度状态
      setGenerationProgress(prev => ({
        ...prev,
        [sceneIndex]: '生成中...'
      }));
      
      console.log(`开始生成场景${sceneIndex + 1}的图片，使用${filteredImages.length}张相关图片...`);
      const result = await callGenerateAPIWithRetry(promptText, filteredImages);
      
      // 更新进度状态为成功
      setGenerationProgress(prev => ({
        ...prev,
        [sceneIndex]: '生成成功'
      }));
      
      return {
        sceneIndex,
        sceneData: scene,
        result: result,
        success: true,
        error: null
      };
    } catch (error) {
      console.error(`场景${sceneIndex + 1}生成失败:`, error);
      
      // 更新进度状态为失败
      setGenerationProgress(prev => ({
        ...prev,
        [sceneIndex]: '生成失败'
      }));
      
      return {
        sceneIndex,
        sceneData: scene,
        result: null,
        success: false,
        error: error
      };
    }
  };

  // 处理单个场景生成
  const handleGenerateSingle = async (sceneIndex: number) => {
    // 验证必要参数
    if (!apiKey.trim()) {
      message.error('请先设置API密钥');
      return;
    }

    if (fileList.length === 0) {
      message.error('请先上传参考图片');
      return;
    }

    const scene = validShots[sceneIndex];
    if (!scene) {
      message.error('场景数据不存在');
      return;
    }

    try {
      // 更新进度状态
      setGenerationProgress(prev => ({
        ...prev,
        [sceneIndex]: '生成中...'
      }));

      // 将所有上传的图片转换为base64
      const base64Images = await Promise.all(
        fileList.map(file => convertImageToBase64(file))
      );

      // 生成单个场景
      const result = await generateSingleScene(sceneIndex, scene, fileList, base64Images);
      
      // 更新生成的图片状态
      setGeneratedImages(prev => {
        const newResults = [...prev];
        newResults[sceneIndex] = result;
        return newResults;
      });
      
      if (result.success) {
        message.success(`场景${sceneIndex + 1}生成成功`);
      } else {
        message.error(`场景${sceneIndex + 1}生成失败: ${result.error instanceof Error ? result.error.message : '未知错误'}`);
      }
      
    } catch (error) {
      console.error(`场景${sceneIndex + 1}生成失败:`, error);
      
      // 更新进度状态为失败
      setGenerationProgress(prev => ({
        ...prev,
        [sceneIndex]: '生成失败'
      }));
      
      const errorResult = {
        sceneIndex,
        sceneData: scene,
        result: null,
        success: false,
        error: error
      };
      
      // 更新错误状态
      setGeneratedImages(prev => {
        const newResults = [...prev];
        newResults[sceneIndex] = errorResult;
        return newResults;
      });
      
      message.error(`场景${sceneIndex + 1}生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 处理全部生成
  const handleGenerateAll = async () => {
    // 验证必要参数
    if (!apiKey.trim()) {
      message.error('请先设置API密钥');
      return;
    }

    if (validShots.length === 0) {
      message.error('请先上传包含场景数据的CSV文件');
      return;
    }

    if (fileList.length === 0) {
      message.error('请先上传参考图片');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress({});
    // 初始化数组，确保有正确的长度
    setGeneratedImages(new Array(validShots.length).fill(null));

    try {
      // 将所有上传的图片转换为base64
      console.log(`开始转换 ${fileList.length} 张图片为base64...`);
      const base64Images = await Promise.all(
        fileList.map(file => convertImageToBase64(file))
      );
      console.log(`成功转换 ${base64Images.length} 张图片`);

      console.log(`开始并发生成 ${validShots.length} 个场景的图片...`);

      // 创建所有场景的生成任务，每个任务完成后立即更新UI
      const generateTasks = validShots.map(async (scene, index) => {
        try {
          const result = await generateSingleScene(index, scene, fileList, base64Images);
          
          // 立即更新生成的图片状态
          setGeneratedImages(prev => {
            const newResults = [...prev];
            newResults[index] = result;
            return newResults;
          });
          
          if (result.success) {
            message.success(`场景${index + 1}生成成功`);
          } else {
            message.error(`场景${index + 1}生成失败: ${result.error instanceof Error ? result.error.message : '未知错误'}`);
          }
          
          return result;
        } catch (error) {
          const errorResult = {
            sceneIndex: index,
            sceneData: scene,
            result: null,
            success: false,
            error: error
          };
          
          // 立即更新错误状态
          setGeneratedImages(prev => {
            const newResults = [...prev];
            newResults[index] = errorResult;
            return newResults;
          });
          
          message.error(`场景${index + 1}生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
          return errorResult;
        }
      });

      // 等待所有任务完成
      const taskResults = await Promise.allSettled(generateTasks);
      
      // 统计最终结果
      const finalResults = taskResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            sceneIndex: index,
            sceneData: validShots[index],
            result: null,
            success: false,
            error: result.reason
          };
        }
      });

      const successCount = finalResults.filter(r => r.success).length;
      const failCount = finalResults.filter(r => !r.success).length;
      
      if (successCount > 0) {
        message.success(`批量生成完成！成功：${successCount}个，失败：${failCount}个`);
      } else {
        message.error('所有场景生成失败，请检查API密钥和网络连接');
      }

    } catch (error) {
      console.error('批量生成失败:', error);
      message.error('批量生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 处理文件上传
  const handleFileUpload = async (file: any) => {
    // 检查是否为CSV文件
    if (file.name.toLowerCase().endsWith('.csv')) {
      try {
        // 读取文件为ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        console.log('文件字节长度:', bytes.length);
        
        // 尝试不同编码
        let decodedText = '';
        let encoding = 'UTF-8';
        
        // 首先尝试UTF-8
        try {
          const utf8Decoder = new TextDecoder('utf-8');
          decodedText = utf8Decoder.decode(bytes);
          console.log('UTF-8解码结果:', decodedText.substring(0, 200));
          
          // 检查是否有乱码
          if (decodedText.includes('') || decodedText.includes('')) {
            throw new Error('UTF-8解码出现乱码');
          }
        } catch (error) {
          console.log('UTF-8解码失败，尝试GBK编码');
          
          // 尝试GBK编码
          try {
            const gbkDecoder = new TextDecoder('gbk');
            decodedText = gbkDecoder.decode(bytes);
            encoding = 'GBK';
            console.log('GBK解码结果:', decodedText.substring(0, 200));
          } catch (gbkError) {
            console.log('GBK解码失败，尝试GB2312编码');
            
            // 尝试GB2312编码
            const gb2312Decoder = new TextDecoder('gb2312');
            decodedText = gb2312Decoder.decode(bytes);
            encoding = 'GB2312';
            console.log('GB2312解码结果:', decodedText.substring(0, 200));
          }
        }
        
        console.log(`使用${encoding}编码成功，开始解析CSV...`);
        
        // 使用PapaParse解析CSV文本
        Papa.parse(decodedText, {
          header: true,
          skipEmptyLines: true,
          complete: (results: any) => {
            console.log('PapaParse解析完成:', results);
            const csvData = results.data;
            
            // 显示所有列名，帮助调试
            if (csvData.length > 0) {
              const headers = Object.keys(csvData[0]);
              console.log('CSV列名:', headers);
            }
            
            // 查找包含分镜提示词的行
            const validShots = csvData.filter((row: any) => {
              // 尝试不同的列名
              const shotNumber = row['分镜数'] || row['分镜'] || row['序号'] || row['编号'];
              const prompt = row['分镜提示词'] || row['提示词'] || row['内容'] || row['描述'];
              
              const hasShotNumber = shotNumber && shotNumber.toString().trim();
              const hasPrompt = prompt && prompt.toString().trim();
              
              console.log('检查行:', row, 'hasShotNumber:', hasShotNumber, 'hasPrompt:', hasPrompt);
              return hasShotNumber && hasPrompt;
            });
            
            console.log('有效的分镜数据:', validShots);
            
            if (validShots.length === 0) {
              message.warning('未找到有效的分镜提示词数据，请检查CSV文件格式');
              
              // 显示调试信息
              const debugInfo = `CSV调试信息:\n\n使用编码: ${encoding}\n\n原始内容:\n${decodedText.substring(0, 500)}...\n\n解析后的数据:\n${JSON.stringify(csvData.slice(0, 3), null, 2)}`;
              setPromptContent(debugInfo);
              return;
            }
            
            // 存储validShots到状态中
            setValidShots(validShots);
            
            const shotPrompts = validShots
              .map((row: any) => {
                const shotNumber = row['分镜数'] || row['分镜'] || row['序号'] || row['编号'] || '';
                const prompt = row['分镜提示词'] || row['提示词'] || row['内容'] || row['描述'] || '';
                return `分镜${shotNumber}:\n${prompt}`;
              })
              .join('\n\n' + '='.repeat(50) + '\n\n');
            
            setPromptContent(shotPrompts);
            message.success(`成功解析CSV文件，提取了${validShots.length}条分镜提示词`);
          },
          error: (error: any) => {
            console.error('PapaParse解析错误:', error);
            message.error('CSV文件解析失败，请检查文件格式');
          }
        });
      } catch (error) {
        console.error('文件读取失败:', error);
        message.error('文件读取失败，请重试');
      }
    } else {
      // JSON文件使用FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setPromptContent(content);
        message.success('文件内容已加载到文本区域');
      };
      reader.readAsText(file);
    }
    
    return false; // 阻止自动上传
  };

  // CSV/JSON 文件上传配置
  const fileUploadProps = {
    name: 'file',
    accept: '.csv,.json',
    beforeUpload: handleFileUpload,
    showUploadList: false,
  };

  return (
    <div className="dashboard-page">
      <div className="page-layout">
        {/* 左侧列 */}
        <div className="left-column">
          {/* 基本信息配置 */}
          <Card 
            title={
              <span>
                <SettingOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                基本配置
              </span>
            }
            extra={
              (apiKey.trim() || apiPlatform || model) ? (
                <span className="auto-save-hint">✅ 已自动保存</span>
              ) : null
            }
            className="basic-config-card"
          >
            <div className="config-form">
              <div className="config-item">
                <label className="config-label">API 密钥</label>
                <Input
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  placeholder="请输入API密钥..."
                  className="config-input"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>
              
              <div className="config-item">
                <label className="config-label">API 平台</label>
                <Select
                  value={apiPlatform}
                  onChange={handleApiPlatformChange}
                  className="config-select"
                  options={[
                    { value: '云雾', label: '云雾' }
                  ]}
                />
              </div>
              
              <div className="config-item">
                <label className="config-label">模型</label>
                <Select
                  value={model}
                  onChange={handleModelChange}
                  className="config-select"
                  options={[
                    { value: 'Sora', label: 'Sora' },
                    { value: 'Nano Banana', label: 'Nano Banana' },
                    { value: '即梦4.0', label: '即梦4.0' }
                  ]}
                />
              </div>
            </div>
          </Card>

          {/* 自定义风格配置 */}
          <Card 
            title={
              <span>
                <BulbOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                自定义风格
              </span>
            }
            extra={null}
            className="custom-style-card"
          >
            <TextArea
              style={{ height: 180 }}
              value={customStyle}
              onChange={handleCustomStyleChange}
              placeholder="请输入自定义风格描述，例如：动漫风格、写实风格、油画风格等..."
              rows={4}
              className="custom-style-textarea"
            />
          </Card>

        </div>

        {/* 右侧列 - 参考图上传和场景管理 */}
        <div className="right-column">
          {/* 参考图上传 */}
          <Card 
            title={
              <span>
                <CloudUploadOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                参考图上传
              </span>
            }
            className="upload-card"
          >
            <Upload.Dragger {...uploadProps} className="upload-dragger">
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined style={{ fontSize: 48, color: '#722ed1' }} />
              </p>
              <p className="ant-upload-text">拖拽图片到此处,或点击选择</p>
              <p className="ant-upload-hint">
                支持 JPG、PNG、GIF 格式，单个文件不超过 10MB
              </p>
            </Upload.Dragger>
            <div className="upload-info">
              {fileList.length}/20 images
            </div>
            
            {/* 图片预览区域 */}
            {fileList.length > 0 && (
              <div className="image-preview-section">
                <div className="preview-title">已上传图片</div>
                <div className="image-grid">
                  {fileList.map((file) => (
                    <div key={file.uid} className="image-item">
                      <Image
                        src={file.thumbUrl || URL.createObjectURL(file.originFileObj)}
                        alt={file.name}
                        className="preview-image"
                        preview={{
                          mask: <div className="preview-mask">预览</div>
                        }}
                      />
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        className="delete-btn"
                        onClick={() => handleRemoveImage(file.uid)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
          {/* 场景管理 */}
          <Card 
            title={
              <span>
                <GlobalOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                场景管理
              </span>
            }
            extra={
              <Space>
                <Upload {...fileUploadProps}>
                  <Button 
                    type="default" 
                    icon={<UploadOutlined />}
                  >
                    JSON/CSV
                  </Button>
                </Upload>
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />}
                  onClick={handleGenerateAll}
                  loading={isGenerating}
                  disabled={isGenerating || validShots.length === 0 || fileList.length === 0 || !apiKey.trim()}
                >
                  {isGenerating ? '生成中...' : '全部生成'}
                </Button>
              </Space>
            }
            className="scene-management-card"
          >
            <div className="scene-content-layout">
              {validShots.length > 0 ? (
                <div className="scenes-list">
                  {validShots.map((scene, index) => {
                    const parsedPrompt = parseScenePrompt(scene);
                    const shotNumber = scene['分镜数'] || scene['分镜'] || scene['序号'] || scene['编号'] || (index + 1);
                    
                    return (
                      <div key={index} className="scene-item">
                        {/* 场景标题 */}
                        <div className="scene-header">
                          <div className="scene-title">场景 {shotNumber}</div>
                          <div className="scene-actions">
                            {editingScene === index ? (
                              <div className="edit-buttons">
                                <Button size="small" onClick={saveEditing} type="primary">保存</Button>
                                <Button size="small" onClick={cancelEditing}>取消</Button>
                              </div>
                            ) : (
                              <div className="action-buttons">
                                <Button size="small" onClick={() => startEditing(index)}>编辑</Button>
                                <Button 
                                  type="primary" 
                                  icon={<PlayCircleOutlined />} 
                                  size="small"
                                  onClick={() => handleGenerateSingle(index)}
                                  loading={generationProgress[index] === '生成中...'}
                                  disabled={!apiKey.trim() || fileList.length === 0}
                                >
                                  单个生成
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 左右两栏布局 */}
                        <div className="scene-content">
                          {/* 左栏：Image Prompt */}
                          <div className="scene-left-panel">
                            <div className="panel-content">
                              <div className="panel-title">
                                <span>Image Prompt</span>
                              </div>
                              {editingScene === index ? (
                                <div className="image-prompt-section">
                                  {/* 编辑模式 */}
                                  <div className="prompt-section">
                                    <div className="field-item">
                                      <TextArea
                                       style={{ height: 360 }}
                                       value={editingContent.subject?.action || ''}
                                       onChange={(e) => updateSubjectContent('action', e.target.value)}
                                       placeholder="输入内容"
                                      />
                                    </div>
                                  </div> 
                                </div>
                              ) : (
                                <div className="image-prompt-section">
                                  {/* 显示模式 */}
                                  {parsedPrompt ? (
                                    <>
                                      {/* 主体部分 */}
                                      {parsedPrompt.subject && (
                                        <div className="prompt-section">
                                          {parsedPrompt.subject.action && (
                                            <div className="field-item">
                                              <div className="field-value action-text">{parsedPrompt.subject.action}</div>
                                            </div>
                                          )}
                                        </div>
                                      )}               
                                    </>
                                  ) : (
                                    <div className="no-scene-message">暂无场景数据</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 右栏：生成的图片 */}
                          <div className="scene-right-panel">
                            <div className="panel-content">
                              <div className="panel-title">
                                <span>生成的图片</span>
                              </div>
                              {(() => {
                                // 安全地获取生成结果，避免undefined错误
                                const generatedResult = generatedImages[index];
                                
                                if (generatedResult && generatedResult.success) {
                                  // 从API返回的content中提取图片URL
                                  const content = generatedResult.result?.choices?.[0]?.message?.content || '';
                                  const imageUrlMatch = content.match(/!\[image\]\((https?:\/\/[^)]+)\)/);
                                  const imageUrl = imageUrlMatch ? imageUrlMatch[1] : '';
                                  
                                  if (imageUrl) {
                                    // 显示生成的图片
                                    return (
                                      <div className="generated-image">
                                        <Image
                                          src={imageUrl}
                                          alt={`场景${index + 1}生成的图片`}
                                          className="result-image"
                                          preview={{
                                            mask: <div className="preview-mask">预览</div>
                                          }}
                                        />
                                      </div>
                                    );
                                  } else {
                                    // 如果无法提取图片URL，显示原始内容
                                    return (
                                      <div className="generated-image">
                                        <div className="content-display">
                                          <div className="content-text">{content}</div>
                                        </div>
                                      </div>
                                    );
                                  }
                                } else if (generatedResult && !generatedResult.success) {
                                  // 显示错误状态
                                  return (
                                    <div className="image-placeholder error">
                                      <div className="image-number">{index + 1}</div>
                                      <div className="error-text">生成失败</div>
                                    </div>
                                  );
                                } else if (isGenerating) {
                                  // 显示生成中状态，显示具体进度
                                  const progress = generationProgress[index] || '等待中...';
                                  return (
                                    <div className="image-placeholder generating">
                                      <div className="image-number">{index + 1}</div>
                                      <div className="generating-text">{progress}</div>
                                    </div>
                                  );
                                } else {
                                  // 显示等待状态
                                  return (
                                    <div className="image-placeholder">
                                      <div className="image-number">{index + 1}</div>
                                      <div className="waiting-text">Waiting...</div>
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="scene-empty-state">
                  <div className="empty-icon">
                    <GlobalOutlined />
                  </div>
                  <div className="empty-title">暂无场景数据</div>
                  <div className="empty-description">
                    请上传包含场景信息的JSON或CSV文件
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


