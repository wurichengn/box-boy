====================PHP SDKʹ��˵��====================
������ֻ��Ҫ���������˵���޸ļ��д��룬�Ϳ�������վ��ʵ�֡�QQ��¼�����ܡ�
1. ��ɡ�QQ��¼��׼������(http://wiki.opensns.qq.com/wiki/%E3%80%90QQ%E7%99%BB%E5%BD%95%E3%80%91%E5%BC%80%E5%8F%91%E6%94%BB%E7%95%A5_Server-side#.E5.87.86.E5.A4.87.E5.B7.A5.E4.BD.9C)��

2. ʹ��ǰ���޸� comm/config.php �е�4������
	$_SESSION["appid"];
	$_SESSION["appkey"];
	$_SESSION["callback"];  
	$_SESSION["scope"];  

3. ��ҳ�����QQ��¼��ť������ĵ�˵����http://wiki.opensns.qq.com/wiki/%E3%80%90QQ%E7%99%BB%E5%BD%95%E3%80%91%E5%BC%80%E5%8F%91%E6%94%BB%E7%95%A5_Server-side#Step1.EF.BC.9A.E6.94.BE.E7.BD.AEQQ.E7.99.BB.E5.BD.95.E6.8C.89.E9.92.AE��
   
   ʾ�����룺	
   <a href="#" onclick='toQzoneLogin()'><img src="img/qq_login.png"></a>

4. ҳ����Ҫ��js����
	<script>
		function toQzoneLogin()
		{
			var A=window.open("oauth/qq_login.php","TencentLogin","width=450,height=320,menubar=0,scrollbars=1, resizab
			le=1,status=1,titlebar=0,toolbar=0,location=1");
		} 
	</script>

5. SDK��ʹ��session�������Ҫ����Ϣ��Ϊ������վ���ڶ����������ͬһ����������ͬ��������ɵ�session�޷��������⣬�뿪���߰��ձ�SDK��comm/session.php�е�ע�Ͷ�session.php���б�Ҫ���޸ģ��Խ����2�����⡣


====================��ǰ�汾��Ϣ====================
��ǰ�汾��V1.0

�������ڣ�2011-11-08

�ļ���С��16.5 K 


====================�޸���ʷ====================
V1.0  ��һ�淢���������ڻ���OAuth2.0��PHP����վ���롣


====================�ļ��ṹ��Ϣ====================
blog�ļ��У�        
	add_blog.php����¼�û�����һƪ����־

comm�ļ��У�
	config.php:�����ļ������ô�����еĺ����
	util.php:  ������OAuth��֤�����л��õ��Ĺ��÷���
        session.php: ֧������������session��֧�ֿ����������session��

img�ļ��У�
	QQ��¼ͼ�꣬�����н��������ͼƬ��Ϊ��ťͼ��

oauth�ļ��У�
	qq_login.php����Ӧ��¼��ť�¼��������û���ת��QQ��¼��Ȩҳ
	qq_ccallback/php����ȡ����Qzone����Ȩ�޵�access_token���洢��ȡ������Ϣ

photo�ļ��У�
	add_album.php�� ��ȡ��¼�û�������б�
	list_album.php����¼�û��������
	upload_pic.php����¼�û��ϴ���Ƭ

share�ļ��У�
        add_share.php����һ����̬��feeds��ͬ����QQ�ռ��У�չ�ָ�����

topic�ļ��У�
	add_topic.php������һ��˵˵��QQ�ռ�


user�ļ��У�
	get_user_info.php����ȡ�û���Ϣ


weibo�ļ��У�
	add_weibo.php������һ��΢��    


QQ��¼����OpenAPI���ڲ��Ͽ��ţ����API�б�http://wiki.opensns.qq.com/wiki/%E3%80%90QQ%E7%99%BB%E5%BD%95%E3%80%91API%E6%96%87%E6%A1%A3



====================��ϵ����====================
QQ��¼������http://connect.qq.com/
��������ʹ�ù��������κ�����ͽ��飬�뷢�ʼ���connect@qq.com ���з�����
���⣬��Ҳ����ͨ����ҵQQ�����룺800030681��ֱ����QQ�ġ�������ϵ�ˡ���������뼴�ɿ�ʼ�Ի�����ѯ��

