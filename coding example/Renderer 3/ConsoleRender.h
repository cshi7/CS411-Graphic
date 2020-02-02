#ifndef _CONSOLE_RENDER_H_
#define _CONSOLE_RENDER_H_

typedef struct _CR
{
	int w, h;
	char* p;
}* CR;

CR createCR(int w, int h);
void clearCR(CR cr);
bool setCR(CR cr, int x, int y, char* s);
void renderCR(CR cr);
void destroyCR(CR cr);

#endif

