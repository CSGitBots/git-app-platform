export AWS_PROFILE=codesherpas

deploy-%:
	pulumi stack select github-apps-$*
	pulumi up

